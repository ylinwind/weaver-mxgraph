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
    var cells = this.editorUi.editor.graph.getSelectionCells();
	var haveNode = false;
	cells.map(v=>{
		if(v instanceof mxCell){ //点击选中节点
			//
			if(document.getElementById('nodeInfo-no-node') != null){
				this.container.removeChild(document.getElementById('nodeInfo-no-node'));
			}
			haveNode = true;
			
			this.drawNodeDetail();
		}
	});
	if(!haveNode){//为点击节点
		var elP = document.getElementById('nodeInfo-no-node');
		if(document.getElementById('nodeInfo-node-detail') != null){
			let _elDiv = document.getElementById('nodeInfo-node-detail');
			this.container.removeChild(_elDiv);
		}
		if(elP == null){
			elP = document.createElement('p');
			elP.id = 'nodeInfo-no-node';
			elP.innerHTML = '暂时没有节点信息';
			this.container.appendChild(elP);
		}
	}
    // getSelectedElement
    // setSelectionCell
    // mxGraph.prototype.selectCellForEvent = function(cell, evt)
    // this.getSelectionModel().setCell(cell);
    // mxGraphSelectionModel
}
WfNodeInfo.prototype.drawNodeDetail = function(){
	if(document.getElementById('nodeInfo-node-detail') != null){
		let _elDiv = document.getElementById('nodeInfo-node-detail');
		this.container.removeChild(_elDiv);
	}
	var detailArr = [
		{label:'节点名称',value:''},
		{label:'操作者',value:''},
		{label:'表单内容',value:''},
		{label:'操作菜单',value:''},
		{label:'节点前附加操作',value:''},
		{label:'节点后附加操作',value:''},
		{label:'签字意见设置',value:''},
		{label:'标题显示设置',value:''},
		{label:'子流程设置',value:''},
		{label:'流程异常处理',value:''},
		{label:'节点字段校验',value:''}
	];
	var elDiv = document.createElement('div');
	elDiv.id = 'nodeInfo-node-detail';
	detailArr.map(v=>{
		var elP = document.createElement('p');
		var elSpanLeft = document.createElement('span');
		var elSpanRight = document.createElement('span');
		elP.className = 'nodeInfo-detail-item';
		elSpanLeft.className = 'detail-item-left detail-item-span';
		elSpanRight.className = 'detail-item-right detail-item-span';
		elSpanLeft.innerHTML = v.label;

		elP.appendChild(elSpanLeft);
		elP.appendChild(elSpanRight);
		elDiv.appendChild(elP);
	});
	this.container.appendChild(elDiv);
}