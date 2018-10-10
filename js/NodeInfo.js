function WfNodeInfo(editorUi, container) {
    this.editorUi = editorUi;
    var editor = editorUi.editor;
    this.container = container;
    var graph = editor.graph;
	
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
	var haveNode = false;
	cells.map(v=>{
		if(v.style.indexOf('fillColor=none;') != -1 && v.style.indexOf('connectable=0;') != -1){ //区域分组
			graph.orderCells(true)
		}
		if(v instanceof mxCell &&  cells.length==1 && !v.isGroupArea &&( v.nodeId || v.linkId)){ //点击选中节点 v.edge != 1 && 不是区域分组 并且有nodeId(校验下nodeId为0的情况)
			if(document.getElementById('nodeInfo-no-node1') != null){
				this.container.removeChild(document.getElementById('nodeInfo-no-node1'));
			}
			haveNode = true;
			
			this.drawNodeDetail();
		}
	});
	if(!haveNode){//
		/*var elP = document.getElementById('nodeInfo-no-node');
		if(document.getElementById('nodeInfo-node-detail') != null){
			let _elDiv = document.getElementById('nodeInfo-node-detail');
			this.container.removeChild(_elDiv);
		}*/
		var elP = document.getElementById('nodeInfo-no-node1');
		if(document.getElementById('nodeInfo-node-detail') != null){
			let _elDiv = document.getElementById('nodeInfo-node-detail');
			this.container.removeChild(_elDiv);
		}
		if(elP == null){
			/*elP = document.createElement('p');
			elP.id = 'nodeInfo-no-node';
			elP.innerHTML = '暂时没有节点信息';*/
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
			elSpanRight.innerHTML = _workflowDetailDatas&&_workflowDetailDatas.workflowDatas.workflowName || 'workfflowName';

			this.container.appendChild(elP);
		}
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
		{label:'操作者',value:'operators'},
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
	
	labelShowDatas.map(v=>{
		var elP = document.createElement('p');
		var elSpanLeft = document.createElement('span');
		var elSpanRight = document.createElement('div');

		elP.className = 'nodeInfo-detail-item';
		elSpanLeft.className = 'detail-item-left detail-item-span';
		elSpanRight.className = 'detail-item-right detail-item-span';
		
		if(v.key === 'name'){//节点名称
			let nowNodeName = document.createElement('input');
			nowNodeName.className = 'detail-item-nowNodeName';
			nowNodeName.type = 'text';
			// nowNodeName.value = detailDatas[v.key];
			nowNodeName.value = isEage ? detailDatas[v.key] : nowCell.value;
			nowNodeName.style.width = '100%';
			nowNodeName.onchange = function(v){
				let val = v.target.value;
				if(val.trim() == ''){
					mxUtils.alert('节点名称不能为空！');
					v.target.value = nowCell.value;
				}else{
					nowCell.valueChanged(val);
				}
			}
			elSpanRight.appendChild(nowNodeName);
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
		elDiv.appendChild(elP);
	});
	this.container.appendChild(elDiv);
}