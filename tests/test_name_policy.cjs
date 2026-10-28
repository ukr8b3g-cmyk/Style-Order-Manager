const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../javascript/style_order_manager.js'),'utf8');
function setup() {
 const nodes=new Map();
 const root={setAttribute(){},querySelectorAll(){return []},querySelector(key){if(!nodes.has(key))nodes.set(key,{value:'',checked:false,disabled:false,options:[],textContent:''});return nodes.get(key)}};
 let resolve,failed=false;const requests=[];
 const context=vm.createContext({onUiLoaded(){},window:{location:{href:'http://som.test/',pathname:'/'}},URL,Set,console,
  fetch:async(url,options)=>{requests.push({url,payload:JSON.parse(options.body)});return await new Promise(r=>resolve=()=>r({ok:!failed,json:async()=>failed?{error:'rejected'}:{name:'New Style 3'}}));}});
 const injected=source.replace('    if (typeof onUiLoaded === "function")',
  '    globalThis.probe={state,validateStyles,nextStyleName,addStyle,setRoot(value){root=value}}; if (typeof onUiLoaded === "function")');
 vm.runInContext(injected,context);const p=context.probe;p.setRoot(root);p.state.language='en';
 return {p,nodes,requests,release(){resolve()},fail(){failed=true}};
}
test('early validation preserves whitespace and defers Unicode identity to server',()=>{
 const {p}=setup();
 for(const names of [['Alpha',' Alpha '],['Straße','STRASSE'],['I','ı']]) {p.state.styles=names.map(name=>({name}));assert.equal(p.validateStyles(),'');}
 p.state.styles=[{name:'New Style'},{name:'new style'}];assert.notEqual(p.validateStyles(),'');
 p.state.styles=[{name:'   '}];assert.notEqual(p.validateStyles(),'');
});
test('add uses the authoritative name, blocks repeat clicks, and releases busy',async()=>{
 const h=setup();h.p.state.styles=[{id:'old',name:'New ſtyle',prompt:'keep',negative_prompt:''}];
 const pending=h.p.addStyle();assert.equal(h.p.state.busy,true);await h.p.addStyle();
 assert.equal(h.requests.length,1);assert.deepEqual(h.requests[0].payload.names,['New ſtyle']);
 h.release();await pending;assert.equal(h.p.state.busy,false);assert.equal(h.p.state.styles[1].name,'New Style 3');assert.equal(h.p.state.styles[0].prompt,'keep');
 const second=h.p.addStyle();h.release();await second;assert.equal(h.requests[1].payload.names.length,2);
});
test('failed naming preserves draft and permits retry',async()=>{
 const h=setup();h.p.state.styles=[{id:'old',name:'Keep',prompt:'keep',negative_prompt:''}];h.p.state.dirty=true;
 h.fail();const pending=h.p.addStyle();h.release();await pending;
 assert.equal(h.p.state.busy,false);assert.equal(h.p.state.styles.length,1);assert.equal(h.p.state.dirty,true);
 assert.match(h.nodes.get('#style-editor-status').textContent,/rejected/);
});
