import asyncio
import json
import os
from pathlib import Path
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

OUT = Path(os.environ.get('QA_OUTPUT', 'C:/Users/diego/AppData/Local/Temp/inspem-sexualidade-qa/integration'))
BASE = os.environ.get('QA_URL', 'http://127.0.0.1:4344')

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with streamable_http_client(os.environ.get('QA_MCP', 'http://localhost:8932/mcp')) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            (OUT/'tools.json').write_text(json.dumps([t.model_dump() for t in tools.tools], indent=2), encoding='utf8')
            print([t.name for t in tools.tools])
            if os.environ.get('QA_DISCOVER'):
                return
            async def call(name, args):
                result = await session.call_tool(name, args)
                text = '\n'.join(c.text for c in result.content if getattr(c, 'text', None))
                if getattr(result, 'is_error', False) or text.startswith('### Error'):
                    raise RuntimeError(text)
                return text
            reports = []
            for w,h in [(320,900),(390,900),(430,950),(768,1000),(1440,1000)]:
                await call('browser_resize', {'width':w,'height':h})
                for label,route in [('home','/'),('sexualidade','/sexualidade/')]:
                    await call('browser_navigate', {'url':BASE+route})
                    result = await call('browser_evaluate', {'function':'''async () => {
                      await document.fonts.ready;
                      const delay=ms=>new Promise(r=>setTimeout(r,ms));
                      // Normal visitor scrolling exercises lazy images before QA preparation.
                      for(let y=0;y<document.body.scrollHeight;y+=650){
                        scrollTo(0,y); await delay(120);
                        await Promise.all([...document.images].filter(i=>{const b=i.getBoundingClientRect();return b.top<innerHeight&&b.bottom>0&&b.left<innerWidth&&b.right>0}).map(i=>i.decode()));
                      }
                      for(const img of document.images) img.loading='eager';
                      await Promise.all([...document.images].map(i=>i.decode()));
                      const faq=[...document.querySelectorAll('#faq details')];
                      for(const d of faq){d.querySelector('summary').click();if(!d.open)throw Error('FAQ');d.querySelector('summary').click();}
                      const track=document.querySelector('.gallery-track');
                      let carousel=null;
                      if(track){track.scrollLeft=0;document.querySelector('[aria-label="Próxima foto"]').click();await delay(600);carousel=track.scrollLeft>0;if(!carousel)throw Error('carousel');track.scrollLeft=0;}
                      const nav=document.querySelector('.service-navigation details');
                      if(nav){nav.querySelector('summary').click();if(nav.querySelectorAll('a').length!==5||!nav.querySelector('[aria-current="page"][href="/sexualidade"]'))throw Error('service navigation');nav.querySelector('summary').click();}
                      const headerMenu=document.querySelector('.header-menu');
                      if(headerMenu&&innerWidth<1100){headerMenu.querySelector('summary').click();if(!headerMenu.open||!headerMenu.querySelector('a[href="/sexualidade"]'))throw Error('mobile menu');headerMenu.querySelector('summary').click();}
                      const broken=[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(a=>a.length>1&&!document.getElementById(a.slice(1)));
                      scrollTo(0,0);await delay(1000);
                      if(document.documentElement.scrollWidth>innerWidth||broken.length)throw Error(JSON.stringify({overflow:document.documentElement.scrollWidth,broken}));
                      const external=performance.getEntriesByType('resource').filter(e=>new URL(e.name).origin!==location.origin).map(e=>e.name);
                      if(external.length)throw Error('Automatic external requests: '+JSON.stringify(external));
                      return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:document.images.length,faq:faq.length,carousel,broken,external,main:document.querySelectorAll('main').length,cards:[...document.querySelectorAll('.service-card')].map(e=>({title:e.querySelector('h3').textContent,height:e.offsetHeight,width:e.offsetWidth}))};
                    }'''})
                    reports.append({'page':label,'viewport':f'{w}x{h}','result':result})
                    await call('browser_take_screenshot', {'filename':str(OUT/f'{label}-{w}.png'),'fullPage':True,'scale':'css'})
                    await call('browser_snapshot', {'filename':str(OUT/f'{label}-{w}.md'),'boxes':True})
                    (OUT/'results.json').write_text(json.dumps(reports,indent=2,ensure_ascii=False),encoding='utf8')
                    print(label,w,result.split('### Ran Playwright code')[0])
                await call('browser_navigate', {'url':BASE+'/'})
                await call('browser_evaluate', {'function':'''() => document.querySelector('.service-card[href="/sexualidade"]').click()'''})
                await call('browser_wait_for', {'time':1})
                await call('browser_evaluate', {'function':'''() => { if(!location.pathname.startsWith('/sexualidade') || !document.querySelector('h1').textContent.includes('Você pode se cobrar menos')) throw Error('Card destination failed'); return location.pathname; }'''})
                await call('browser_evaluate', {'function':'''() => document.querySelector('.service-navigation .home-link').click()'''})
                await call('browser_wait_for', {'time':1})
                await call('browser_evaluate', {'function':'''() => { if(location.pathname!=='/' || document.querySelectorAll('.service-card').length!==5) throw Error('Return home failed'); return 'card and return home passed'; }'''})
                print('Navigation round trip passed:', w)
            print(await call('browser_console_messages',{'level':'error'}))

asyncio.run(main())
