function WfNodeInfo(editorUi, container) {
    this.editorUi = editorUi;
    var editor = editorUi.editor;
    this.container = container;
    var graph = editor.graph;
	
	this.nodePanelHide = false;
	this.update = mxUtils.bind(this, function(sender, evt)
	{
		this.clearSelectionState();
		this.refresh();
	});
	
	graph.getSelectionModel().addListener(mxEvent.CHANGE, this.update);
	graph.addListener(mxEvent.EDITING_STARTED, this.update);
	graph.addListener(mxEvent.EDITING_STOPPED, this.update);
	graph.getModel().addListener(mxEvent.CHANGE, this.update);
	graph.addListener(mxEvent.ROOT, mxUtils.bind(this, function()
	{
		this.refresh();
    }));
    this.init();
    this.refresh();
}
WfNodeInfo.prototype.init = function(){
    this.drawHeader();
	this.drawFoder();
}
// paint header
WfNodeInfo.prototype.drawHeader = function(){
    var elDiv = document.createElement('div');
    elDiv.className = 'nodeInfo-header';
    elDiv.innerHTML = '节点信息';
    this.container.appendChild(elDiv);
}

WfNodeInfo.prototype.refresh = function(){
    this.nodeActions();
}
/**
 * Returns information about the current selection.
 */
WfNodeInfo.prototype.clearSelectionState = function()
{
	this.selectionState = null;
};

/**
 * Returns information about the current selection.
 */
WfNodeInfo.prototype.getSelectionState = function()
{
	if (this.selectionState == null)
	{
		this.selectionState = this.createSelectionState();
	}
	
	return this.selectionState;
};
/**
 * Returns information about the current selection.
 */
WfNodeInfo.prototype.createSelectionState = function()
{
	var cells = this.editorUi.editor.graph.getSelectionCells();
	var result = this.initSelectionState();
	
	// for (var i = 0; i < cells.length; i++)
	// {
	// 	this.updateSelectionStateForCell(result, cells[i], cells);
	// }
	
	return result;
};/**
* Returns information about the current selection.
*/
WfNodeInfo.prototype.initSelectionState = function()
{
   return {vertices: [], edges: [], x: null, y: null, width: null, height: null, style: {},
       containsImage: false, containsLabel: false, fill: true, glass: true, rounded: true,
       comic: true, autoSize: false, image: true, shadow: true, lineJumps: true};
};

WfNodeInfo.prototype.nodeActions = function(){
	var graph = this.editorUi.editor.graph;
	var _workflowDetailDatas = graph.workflowDetailDatas;
    var cells = graph.getSelectionCells();
	console.log(cells,'celsss');
	var haveNode = false , noNodeOrLinkId = false;
	
	if(document.getElementById('nodeInfo-detail-shouldSaveFirst') != null){
		this.container.removeChild(document.getElementById('nodeInfo-detail-shouldSaveFirst'));
	}
	cells.map(v=>{
		if(v.style.indexOf('fillColor=none;') != -1 && v.style.indexOf('connectable=0;') != -1){ //区域分组
			graph.orderCells(true)
		}
		if(v instanceof mxCell &&  cells.length==1 && !v.isGroupArea ){ //点击选中节点 v.edge != 1 && 不是区域分组 并且有nodeId linkId(校验下nodeId为0的情况)
			if(v.nodeId || v.linkId){
				if(document.getElementById('nodeInfo-no-node1') != null){
					this.container.removeChild(document.getElementById('nodeInfo-no-node1'));
				}
				this.drawNodeDetail();
			}else{
				noNodeOrLinkId = true;
			}
			haveNode = true;
		}
	});
	if(!haveNode){//
		this.renderWorkdlowItem();
	}
	if(haveNode && noNodeOrLinkId){
		this.renderWorkdlowItem();
		if(document.getElementById('nodeInfo-detail-shouldSaveFirst') != null){
			let re_elP = document.getElementById('nodeInfo-detail-shouldSaveFirst');
			this.container.removeChild(re_elP);
		}
		if(document.getElementById('nodeInfo-detail-nodeLinkDetail') != null){
			let _elDiv = document.getElementById('nodeInfo-detail-nodeLinkDetail');
			_elDiv.style.display = 'none';
			// this.container.removeChild(_elDiv);
		}
		let _elP = document.createElement('p');
		_elP.id = 'nodeInfo-detail-shouldSaveFirst';
		_elP.innerHTML = '温馨提示：需要先保存流程图才能对新增节点和出口进行详细属性设置！';
		this.container.appendChild(_elP);
	}
}

/**
创建流程名称一栏
 */
WfNodeInfo.prototype.renderWorkdlowItem = function(){
	var graph = this.editorUi.editor.graph;
	var _workflowDetailDatas = graph.workflowDetailDatas;

	var elP = document.getElementById('nodeInfo-no-node1');
	if(document.getElementById('nodeInfo-node-detail') != null){
		let _elDiv = document.getElementById('nodeInfo-node-detail');
		this.container.removeChild(_elDiv);
	}
	if(elP == null){
		elP = document.createElement('p');
		let elSpanLeft = document.createElement('span');
		let elSpanRight = document.createElement('div');
		elP.id = 'nodeInfo-no-node1';
		elP.className = 'nodeInfo-detail-item';
		elSpanLeft.className = 'detail-item-left detail-item-span';
		elSpanRight.className = 'detail-item-right detail-item-span';
		elP.appendChild(elSpanLeft);
		elP.appendChild(elSpanRight);
		
		elSpanLeft.innerHTML = '流程名称';
		elSpanRight.innerHTML = _workflowDetailDatas&&_workflowDetailDatas.workflowDatas.workflowName || 'workflowName';

		this.container.appendChild(elP);
	}else{
		elP.childNodes[1].innerHTML = _workflowDetailDatas&&_workflowDetailDatas.workflowDatas.workflowName || 'workflowName';
	}
}
WfNodeInfo.prototype.drawNodeDetail = function(){
	var graph = this.editorUi.editor.graph;
	var _workflowDetailDatas = graph.workflowDetailDatas;
	var nowCell = graph.getSelectionCell();
	console.log(_workflowDetailDatas,'graph workflowDetailDatas',nowCell)
	var isEage = false ,//是否是连接线
		detailDatas = {} , //当前显示数据
		isCouldShow = false;//是否设置完成，在返回数据当中存在，不存在提示保存后显示

	if(nowCell.edge) isEage = true;
	
	if(nowCell.nodeId != null)  isCouldShow = true;

	if(_workflowDetailDatas != null){
		let mapDatas = null;
		if(isEage){
			mapDatas = _workflowDetailDatas.linkDatas || {};
		}else{
			mapDatas = _workflowDetailDatas.nodeDatas || {};
		}
		for(let i in mapDatas){
			if((!isEage && i == nowCell.nodeId) || (isEage && i == nowCell.linkId)){
				detailDatas = mapDatas[i];
			}
		}
	}

	if(document.getElementById('nodeInfo-node-detail') != null){
		let _elDiv = document.getElementById('nodeInfo-node-detail');
		this.container.removeChild(_elDiv);
	}

	var nodeDetailArr = [
		{label:'节点名称',value:'',key:'name'},
		{label:'操作者',value:'',key:'operators'},
		{label:'表单内容',value:'',key:'hasNodeForFie'},
		{label:'操作菜单',value:'',key:'hasCusRigKey'},
		{label:'节点前附加操作',value:'',key:'hasNodeBefAddOpr'},
		{label:'节点后附加操作',value:'',key:'hasNodeAftAddOpr'},
		{label:'签字意见设置',value:'',key:'hasOperateSign'},
		{label:'标题显示设置',value:'',key:'hasOperateTitle'},
		{label:'子流程设置',value:'',key:'hasOperateSubwf'},
		{label:'流程异常处理',value:'',key:'hasOperateException'},
		{label:'节点字段校验',value:'',key:'hasNodePro'}
	];
	var linkDetailArr = [
		{label:'出口名称',value:'',key:'name'},
		{label:'目标节点',value:''},
		{label:'生成编号',value:'',key:'isBuildCode'},
		{label:'条件',value:'',key:'hasCondition'},
		{label:'附加规则',value:'',key:'hasRole'},
		{label:'出口提示信息',value:'',key:'remindMsg'}
	];
	var labelShowDatas = isEage ? linkDetailArr : nodeDetailArr;
	var elDiv = document.createElement('div');
	elDiv.id = 'nodeInfo-node-detail';

	var elNodeLinkDetail;
	elNodeLinkDetail = document.createElement('div');
	elNodeLinkDetail.id = 'nodeInfo-detail-nodeLinkDetail';

	labelShowDatas.map(v=>{
		let item = this.createNodeItem(isEage,v,detailDatas,nowCell);
		elNodeLinkDetail.appendChild(item);
	});
	elDiv.appendChild(elNodeLinkDetail);
	this.container.appendChild(elDiv);
}
/**
创建节点信息的每项信息
 */
WfNodeInfo.prototype.createNodeItem = function(isEage,v,detailDatas,nowCell){
	var elP = document.createElement('p');
	var elSpanLeft = document.createElement('span');
	var elSpanRight = document.createElement('div');

	elP.className = 'nodeInfo-detail-item';
	elSpanLeft.className = 'detail-item-left detail-item-span';
	elSpanRight.className = 'detail-item-right detail-item-span';
	
	if(v.key === 'name'){//节点名称
		let wfNameElt = this.createNodeNameElement(isEage,v.key,detailDatas,nowCell);
		elSpanRight.appendChild(wfNameElt);
	}else if(v.key === 'operators'){
		let operatorEle = this.createOperatorElement();
		elSpanRight.appendChild(operatorEle);
	}else{
		var checkSpanIcon = document.createElement('span');
		checkSpanIcon.className = 'icon-workflow-shezhi';
		elSpanRight.appendChild(checkSpanIcon);
	}
	if(detailDatas[v.key] == 'true'){//已经设置打√
		var checkSpanIcon = document.createElement('span');
		checkSpanIcon.className = 'icon-workflow-duigou';
		elSpanRight.appendChild(checkSpanIcon);
	}
	elSpanLeft.innerHTML = v.label;

	elP.appendChild(elSpanLeft);
	elP.appendChild(elSpanRight);

	return elP;
}
/**
创建节点名称元素
 */
WfNodeInfo.prototype.createNodeNameElement = function(isEage,key,detailDatas,nowCell){
	var graph = this.editorUi.editor.graph;
	var model = graph.model;

	let nowNodeName = document.createElement('input');
	nowNodeName.className = 'detail-item-nowNodeName';
	nowNodeName.type = 'text';
	nowNodeName.value = isEage ? detailDatas[key] : nowCell.value;
	nowNodeName.style.width = '100%';
	nowNodeName.onchange = function(v){
		let val = v.target.value;
		if(val.trim() == ''){
			mxUtils.alert('节点名称不能为空！');
			v.target.value = nowCell.value;
		}else{
			model.beginUpdate();
			try
			{
				model.setValue(nowCell,val);
			}
			finally
			{
				model.endUpdate();
			}
		}
	}
	return nowNodeName;
}
/**
创建操作者元素
 */
WfNodeInfo.prototype.createOperatorElement = function(){
	let operatorArea = document.createElement('div');
	let leftArea = document.createElement('div');
	let rightArea = document.createElement('div');

	operatorArea.className = 'operators-area';
	leftArea.className = 'operators-left-area';
	rightArea.className = 'operators-right-area';
	
	rightArea.innerHTML = '+';

	operatorArea.appendChild(leftArea);
	operatorArea.appendChild(rightArea);

	return operatorArea;
}
/**
*绘制折叠展开按钮
*
*/
WfNodeInfo.prototype.drawFoder = function(){
	var elDiv = document.createElement('div');
    elDiv.className = 'nodeInfo-panel-folder';
	elDiv.innerHTML = '>';
	this.container.appendChild(elDiv);

	elDiv.onclick = this.clickNodeFolder.bind(this,elDiv);
}
WfNodeInfo.prototype.clickNodeFolder = function(elt){
	var wfEditor = this.editorUi.wfEditor;
	var diagramContainer = this.editorUi.diagramContainer;
	var graph = this.editorUi.editor.graph;
	var model = graph.model;

	this.nodePanelHide = !this.nodePanelHide;
	//加与不加update都一样
	// model.beginUpdate();
	try
	{
		if(this.nodePanelHide){//隐藏 向右移动隐藏
			wfEditor.container.style.width = '100%';
			diagramContainer.style.width = '100%';
			graph.pageFormat.width = window.innerWidth-2;
			this.container.style.transform = 'translateX(240px)';
			elt.style.left = '-18px';
			elt.innerHTML = '<';
		}else{//显示 向左移动显示
			this.container.style.transform = 'translateX(0)';
			elt.style.left = '0';
			elt.innerHTML = '>';
			wfEditor.container.style.width = 'calc(100% - 240px)';
			diagramContainer.style.width = 'calc(100% - 240px)';
			graph.pageFormat.width = window.innerWidth - 250;
		}
		graph.refresh();
	}
	finally
	{
		// model.endUpdate();
	}
	
}