"""Focused MCP team-photo QA. Run one service per batch; persist every result."""
import asyncio
import json
import os
import sys
from pathlib import Path
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

OUT = Path(os.environ.get('QA_OUTPUT', 'C:/Users/diego/AppData/Local/Temp/inspem-team-qa'))
BASE = os.environ.get('QA_URL', 'http://127.0.0.1:4344')

async def main():
    slug = sys.argv[1]
    OUT.mkdir(parents=True, exist_ok=True)
    async with streamable_http_client(os.environ.get('QA_MCP', 'http://localhost:8935/mcp')) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            names = {t.name for t in tools.tools}
            assert {'browser_evaluate','browser_take_screenshot','browser_snapshot'} <= names
            async def call(name, args):
                result = await session.call_tool(name, args)
                text = '\n'.join(c.text for c in result.content if getattr(c, 'text', None))
                if getattr(result, 'is_error', False) or text.startswith('### Error'):
                    raise RuntimeError(text)
                return text
            reports = []
            for w,h in [(320,900),(390,900),(430,950),(768,1000),(1440,1000)]:
                await call('browser_resize', {'width': w, 'height': h})
                await call('browser_navigate', {'url': BASE+'/'+slug+'/'})
                result = await call('browser_evaluate', {'function': '''async () => {
                    await document.fonts.ready;
                    const img=document.querySelector('.team-photo img');
                    img.scrollIntoView({block:'center'});
                    await img.decode();
                    for(const i of document.images) i.loading='eager';
                    await Promise.all([...document.images].map(i=>i.decode()));
                    await new Promise(r=>setTimeout(r,650));
                    const box=img.getBoundingClientRect(), css=getComputedStyle(img);
                    const response=await fetch(img.currentSrc);
                    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await response.arrayBuffer()))].map(v=>v.toString(16).padStart(2,'0')).join('');
                    if(response.status!==200 || hash!=='0591fbe517548f280eb0991f0ee2fe7fcefd9615ee6b4ee3424e9475a6ab4b83')throw Error('Wrong asset/network');
                    if(img.naturalWidth!==1391 || img.naturalHeight!==1131)throw Error('Wrong dimensions');
                    if(box.left<0 || box.right>innerWidth)throw Error('Team photo overflow: '+JSON.stringify(box.toJSON()));
                    if(css.objectPosition!=='50% 0%')throw Error('Wrong framing: '+css.objectPosition);
                    return {src:img.currentSrc,status:response.status,hash,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,position:css.objectPosition,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,box:box.toJSON()};
                }'''})
                await call('browser_take_screenshot', {'filename':str(OUT/f'{slug}-{w}-team.png'),'fullPage':False,'scale':'css'})
                await call('browser_take_screenshot', {'filename':str(OUT/f'{slug}-{w}-full.png'),'fullPage':True,'scale':'css'})
                await call('browser_snapshot', {'filename':str(OUT/f'{slug}-{w}.md'),'boxes':True})
                reports.append({'slug':slug,'width':w,'result':result})
                (OUT/f'{slug}-results.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
                print(slug,w,'PASS',flush=True)
            (OUT/f'{slug}-console.txt').write_text(await call('browser_console_messages', {'level':'error'}),encoding='utf8')

asyncio.run(main())
