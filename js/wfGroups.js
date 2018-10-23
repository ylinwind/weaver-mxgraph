/**
*
*流程图分组
*/
function wfGroups(editorUi, container){
    this.editorUi = editorUi;
    this.container = container;

    this.rowGroups = [];
    this.colGroups = [];
    this.init();
}
/**
groups:[{
    type:'col' || 'row',
    position:{left:'',top:''},
    panelWidth:'',
    panelHeight:'',
    value:''
    ...
}]
 */
wfGroups.prototype.init = function(groupsParams={}){
    this.rowGroups = groupsParams.row || [];
    this.colGroups = groupsParams.col || [];
    this.refresh();
    console.log(this.editorUi, this.container,'editorUi, container');
}
/**
*
*/
wfGroups.prototype.refresh = function(modelChange = false){
    var graph = this.editorUi.editor.graph;
    var minimumGraphSize = graph.minimumGraphSize;

    this.container.style.width = (minimumGraphSize?minimumGraphSize.width:0) + 'px';
    this.container.style.height = (minimumGraphSize?minimumGraphSize.height:0) + 'px';

    this.container.innerHTML = '';
    this.paintGroups();
    !modelChange && graph.graphModelChanged([]);
}
/**
*添加横向分组
 */
wfGroups.prototype.addRowGroup = function(rowObj = {}){
    let newTopPosition = 0;
    this.rowGroups.map(v=>{
        if(v.position.top && v.position.top > newTopPosition){
            newTopPosition = v.position.top;
        }
    });
    newTopPosition += 150;
    rowObj['position']['top'] = newTopPosition;
    this.rowGroups.push(rowObj);
    this.refresh();
}
/**
*添加纵向分组
 */
wfGroups.prototype.addColGroup = function(colObj = {}){
    let newLeftPosition = 0;
    this.colGroups.map(v=>{
        if(v.position.left && v.position.left > newLeftPosition){
            newLeftPosition = v.position.left;
        }
    });
    newLeftPosition += 150;
    colObj['position']['left'] = newLeftPosition;
    this.colGroups.push(colObj);
    this.refresh();
}
/**
*绘制分组
 */
wfGroups.prototype.paintGroups = function(){
    this.colGroups.map((v,i)=>{
        let elt = this.createGroupElement(v,i);
        let groupPanel = this.createGroupPanelElement(v,i);
        this.container.appendChild(groupPanel);
        this.container.appendChild(elt);
    });
    this.rowGroups.map((v,i)=>{
        let elt = this.createGroupElement(v,i);
        let groupPanel = this.createGroupPanelElement(v,i);
        this.container.appendChild(groupPanel);
        this.container.appendChild(elt);
    });
}
/**
*创建分组元素
 */
wfGroups.prototype.createGroupElement = function(item,index){
    
    if(item == null){
        return;
    }
    var element = document.createElement('p');
    item.type == 'col' ? element.className = 'workflow-col-group' : element.className = 'workflow-row-group';
    for(let key in item['position']){
        element.style[key] = item['position'][key] + 'px';
    }
    this.groupDragAction(element,item.type,index);
    return element;
}
/**
*创建每个分组面板信息元素
*
*/
wfGroups.prototype.createGroupPanelElement = function(item,index){
    var graph = this.editorUi.editor.graph;
    if(item == null){
        return;
    }
    let groupArea,groupItem;
    if(item.type == 'row'){
        if(document.getElementById('col-group-panel-area')){
            groupArea = document.getElementById('col-group-panel-area');
        }else{
            groupArea = document.createElement('div');
            groupArea.id = 'col-group-panel-area';
        }
        groupArea.style.width = graph.minimumGraphSize.height + 'px';
    }else{
        if(document.getElementById('row-group-panel-area')){
            groupArea = document.getElementById('row-group-panel-area');
        }else{
            groupArea = document.createElement('div');
            groupArea.id = 'row-group-panel-area';
        }
    }
    groupItem = this.createGroupPanelItem(item,index);
    groupArea.appendChild(groupItem);
    return groupArea;
}
/**
* icon : ↑-icon-coms-Reverse  ↓-icon-coms-positive-sequence  ←-icon-coms-Last-step  →-icon-coms-Next-step
* ×-anticon anticon-cross
*/
wfGroups.prototype.createGroupPanelItem = function(item,index){
    let groupItem = document.createElement('div');
    let infoArea = document.createElement('div');
    let actionArea = document.createElement('div');
    let inputName = document.createElement('input');
    inputName.className = 'group-item-input';
    var sb = this;
    inputName.onblur = function(e){
        this.style.display = 'none';
        let val = e.target.value;
        item.type=='col'?sb.colGroups[index].value = val:sb.rowGroups[index].value = val;
        sb.refresh();
    }

    let actions = ['icon-coms-Last-step','icon-coms-Next-step','anticon anticon-cross'];
    actions.map((v,i)=>{
        let actionItem = document.createElement('span');
        actionItem.className = `${v} action-item`;
        actionItem = this.groupPanelActionEvent(actionItem,v,index,item);
        actionArea.appendChild(actionItem);
    })

    groupItem.className = `${item.type}-group-item`;
    item.type=='col' ? groupItem.style.width = (item.panelWidth || 150) + 'px':
                        groupItem.style.width = (item.panelHeight || 150) + 'px';
                        // groupItem.style.height = (item.panelHeight || 150) + 'px';
    actionArea.className = 'group-item-action';

    infoArea.className = 'group-item-info';
    infoArea.innerHTML = item.value;
    infoArea.title = item.value;
    infoArea.ondblclick = function(e){
        let input = e.target.childNodes[1];
        input.style.display = 'inline';
        input.value = item.value
        input.focus();
    }
    infoArea.appendChild(inputName);
    groupItem.appendChild(infoArea);
    groupItem.appendChild(actionArea);
    return groupItem;
}
/**
*分组事件 拖拽
*
 */
wfGroups.prototype.groupDragAction = function(element,direction = 'col',index){
	var mouseDownX,mouseDownY,initX,initY,flag = false;
    var sb = this;

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
            if(direction == 'col'){
                let left = parseInt(mouseMoveX) - parseInt(mouseDownX) + parseInt(initX);

                let _groups = sb.colGroups;
                let leftNum = left - sb.colGroups[index].position.left;
                _groups.map((v,i)=>{
                    if(i>=index && v.type == 'col'){
                        _groups[i].position.left = v.position.left + leftNum;
                        i==index ? _groups[i].panelWidth = _groups[i].panelWidth + leftNum : '';
                    }
                });
                sb.colGroups = _groups;
            }else{
                let top = parseInt(mouseMoveY) - parseInt(mouseDownY) + parseInt(initY);

                let _groups = sb.rowGroups;
                let topNum = top - sb.rowGroups[index].position.top;
                _groups.map((v,i)=>{
                    if(i>=index && v.type == 'row'){
                        _groups[i].position.top = v.position.top + topNum;
                        i == index ? _groups[i].panelHeight = _groups[i].panelHeight + topNum : '';
                    }
                });
                sb.rowGroups = _groups;
            }
            sb.refresh();
		}
	}
	document.onmouseup = function(e) {
		e.stopPropagation();
		//标识已松开鼠标
		document.onmousemove = null;
		// this.onmouseup = null;
	}
	
}
/**
*分组面板操作事件 <- -> ×
*
*/
wfGroups.prototype.groupPanelActionEvent = function(elt,item,groupIndex,groupItem){
    var sb = this;
    if(item.indexOf('Last') != -1){// 向前 <-
        elt.onclick = function(){
            if(groupIndex == 0){ 
                return;
            }else{
                let _groups = groupItem.type=='col'?sb.colGroups:sb.rowGroups;
                _groups.splice(groupIndex,1);
                groupItem.type=='col'?groupItem.position.left -= _groups[groupIndex-1].panelWidth:
                                       groupItem.position.top -= _groups[groupIndex-1].panelHeight;
                
                _groups.splice(groupIndex-1,0,groupItem);
                groupItem.type=='col'?_groups[groupIndex].position.left += groupItem.panelWidth:
                                    _groups[groupIndex].position.top += groupItem.panelHeight;
                sb.refresh();
            }
        }
    }else if(item.indexOf('Next') != -1){//向后 ->
        elt.onclick = function(){
            let _groups = groupItem.type=='col'?sb.colGroups:sb.rowGroups;
            if(groupIndex == _groups.length - 1){
                return;
            }else{
                _groups.splice(groupIndex,1);
                groupItem.type=='col'?groupItem.position.left += _groups[groupIndex].panelWidth:
                                    groupItem.position.top += _groups[groupIndex].panelHeight;
                _groups.splice(groupIndex+1,0,groupItem);
                groupItem.type=='col'?_groups[groupIndex].position.left -= groupItem.panelWidth:
                                    _groups[groupIndex].position.top -= groupItem.panelHeight;
                sb.refresh();
            }
        }
    }else{//删除 ×
        elt.onclick = function(){
            let _groups = groupItem.type=='col'?sb.colGroups:sb.rowGroups;
            _groups.splice(groupIndex,1);
            _groups.map((v,i)=>{
                if(i>=groupIndex){
                    groupItem.type=='col'?_groups[i].position.left -= groupItem.panelWidth:
                                    _groups[i].position.top -= groupItem.panelHeight;
                    
                }
            })
            sb.refresh();
        }
    }
    return elt;
}
/**
 */
wfGroups.prototype.createGroupItemNameElement = function(){
    let WeaInput = window.ecCom.WeaInput;

    ReactDOM.render(
        React.createElement(WeaInput,
        {
            viewAttr:2,
            value:'',
            onBlur:(v)=>{
            },
        }),
        document.getElementById("nodeName-container")
	);
}
/**
 */
wfGroups.prototype.getGroupsValue = function(){
    return {row:this.rowGroups,col:this.colGroups};
}
