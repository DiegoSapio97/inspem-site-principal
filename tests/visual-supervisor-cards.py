import argparse
import asyncio
import json
from pathlib import Path
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

parser = argparse.ArgumentParser()
parser.add_argument('--output', default='C:/Users/diego/AppData/Local/hermes/cache/scratch/sexualidade-copy-qa/tiago-cards')
OUT = Path(parser.parse_args().output)
SLUGS = ['ansiedade', 'depressao', 'tdah', 'avaliacao-neuropsicologica']
CHECK = '''async () => {
 await document.fonts.ready;
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 for(let y=0;y<document.body.scrollHeight;y+=700){
   scrollTo({top:y,behavior:'instant'}); await delay(100);
   await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0}).map(i=>i.decode()));
 }
 for(const i of document.images)i.loading='eager';
 await Promise.all([...document.images].map(i=>i.decode()));
 scrollTo({top:0,behavior:'instant'});await delay(1000);
 const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
 const cards=[...document.querySelectorAll('#equipe .sup')];
 const names=cards.map(c=>c.querySelector('h3').textContent);
 const expected=location.pathname.includes('avaliacao-neuropsicologica')?['Simone Regina Sandri','Tiago Ribeiro']:['Simone Sandri Modesti','Ingrid Francke','Tiago Ribeiro'];
 if(JSON.stringify(names)!==JSON.stringify(expected))throw Error('Names: '+names);
 const overflow=[...document.querySelectorAll('#equipe .sup, #equipe .sup *')].filter(e=>{const b=e.getBoundingClientRect();return b.left<0||b.right>innerWidth+1||e.scrollWidth>e.clientWidth+1}).map(e=>e.outerHTML.slice(0,160));
 if(overflow.length||document.documentElement.scrollWidth>innerWidth)throw Error('Overflow '+JSON.stringify(overflow));
 for(const c of cards){const b=c.getBoundingClientRect();for(const e of c.querySelectorAll('img,h3,p,li')){const r=e.getBoundingClientRect();if(r.left<b.left||r.right>b.right+1||r.bottom>b.bottom+1)throw Error('Card containment');}}
 return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,names,cards:cards.map(c=>({name:c.querySelector('h3').textContent,box:box(c),image:box(c.querySelector('img'))})),grid:box(document.querySelector('#equipe .supervisors')),imagesLoaded:[...document.images].every(i=>i.complete&&i.naturalWidth>0),overflow};
}'''

async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 async with streamable_http_client('http://localhost:8931/mcp') as (r,w,*_):
  async with ClientSession(r,w) as s:
   await s.initialize()
   tools=await s.list_tools()
   (OUT/'tools.json').write_text(json.dumps([t.model_dump() for t in tools.tools],indent=2),encoding='utf8')
   async def call(name,args):
    result=await s.call_tool(name,args)
    text='\n'.join(c.text for c in result.content if getattr(c,'text',None))
    if getattr(result,'is_error',False) or text.startswith('### Error'):raise RuntimeError(text)
    return text
   results=[]
   for slug in SLUGS:
    for width,height in [(320,900),(390,900),(430,950),(768,1000),(1440,1000)]:
     await call('browser_resize',{'width':width,'height':height})
     await call('browser_navigate',{'url':f'http://127.0.0.1:4348/{slug}/'})
     result=await call('browser_evaluate',{'function':CHECK})
     data=json.loads(result.split('### Result\n')[1].split('\n###')[0])
     await call('browser_snapshot',{'filename':str(OUT/f'{slug}-{width}.md'),'boxes':True})
     await call('browser_take_screenshot',{'filename':str(OUT/f'{slug}-{width}.png'),'fullPage':True,'scale':'css'})
     console=await call('browser_console_messages',{'level':'error'})
     results.append({'page':slug,'width':width,'geometry':data,'console':console})
     (OUT/'results.json').write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding='utf8')
     print(slug,width,'PASS',flush=True)
   assert len({(r['page'],r['width']) for r in results})==20
   print('Verified 20 unique page/viewport pairs')

asyncio.run(main())
