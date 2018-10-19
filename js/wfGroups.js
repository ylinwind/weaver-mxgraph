/**
*
*流程图分组
*/
function wfGroups(editorUi, container){
    this.editorUi = editorUi;
    this.container = container;

    this.groups = [];
    this.init();
}
/**
groups:[{
    type:'col' || 'row',
    position:{left:'',top:''},
    ...
}]
 */
wfGroups.prototype.init = function(){

    console.log(this.editorUi, this.container,'editorUi, container');
}
/**
*
 */
wfGroups.prototype.refresh = function(){
    this.container.innerHTML = '';
    this.paintGroups();
    console.log(this.editorUi, this.container,'editorUi, container');
}
/**
*添加横向分组
 */
wfGroups.prototype.addRowGroup = function(rowObj = {}){
    this.groups.push(rowObj);
    this.refresh();
}
/**
*添加纵向分组
 */
wfGroups.prototype.addColGroup = function(colObj = {}){
    this.groups.push(colObj);
    this.refresh();
}
/**
*绘制分组
 */
wfGroups.prototype.paintGroups = function(){
    let groups = this.groups;
    groups.map(v=>{
        let elt = this.createGroupElement(v);
        this.container.appendChild(elt);
    });
}
/**
*创建分组元素
 */
wfGroups.prototype.createGroupElement = function(item){
    
    if(item == null){
        return;
    }
    var element = document.createElement('p');
    item.type == 'col' ? element.className = 'workflow-col-group' : element.className = 'workflow-row-group';
    for(let key in item['position']){
        element.style[key] = item['position'][key] + 'px';
    }
    // colGroup.style.top = '135px' : colGroup.style.top = '100x';
    workflowUi.wfEditor.tipInfoDisplay = 'block' ? element.style.top = '135px' : element.style.top = '100x';

    this.groupDragAction(element,item.type);
    return element;
}
/**
*分组事件
*
 */
wfGroups.prototype.groupDragAction = function(element,direction = 'col'){
	var mouseDownX,mouseDownY,initX,initY,flag = false;
	element.onmousedown = function(e) {
		e.stopPropagation();
		//鼠标按下时的鼠标所在的X，Y坐标
		mouseDownX = e.pageX;
		mouseDownY = e.pageY;
	
		//初始位置的X，Y 坐标
		initX = element.offsetLeft;
		initY = element.offsetTop;

		document.onmousemove = function(ev) {
			
			var mouseMoveX = ev.pageX,mouseMoveY = ev.pageY;
			direction == 'col' ?element.style.left = parseInt(mouseMoveX) - parseInt(mouseDownX) + parseInt(initX) + "px" :
			element.style.top = parseInt(mouseMoveY) - parseInt(mouseDownY) + parseInt(initY) + "px";
		}
	}
	document.onmouseup = function(e) {
		e.stopPropagation();
		//标识已松开鼠标
		document.onmousemove = null;
		// this.onmouseup = null;
	}
	
}