function WfNodeInfo(editorUi, container) {
    this.editorUi = editorUi;
    var editor = editorUi.editor;
    this.container = container;
    var graph = editor.graph;
	
	this.nodePanelHide = false;
	this.update = mxUtils.bind(this, function(sender, evt)
	{
		this.clearSelectionState();
		!this.noNeedRefresh && this.refresh();
		this.noNeedRefresh = false;
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
	this.nodeNameRef = null;
}
WfNodeInfo.prototype.init = function(){
    // this.drawHeader();
	// this.drawFoder();
}
// paint header
WfNodeInfo.prototype.drawHeader = function(){
	var graph = this.editorUi.editor.graph;
    var cells = graph.getSelectionCells();

	var headerStr = '流程信息';
	if(cells.length == 1){
		if(cells[0].edge){
			headerStr = '出口信息';
		}else{
			headerStr = '节点信息';
		}
	}
	var elDiv;
	if(document.getElementById('nodeInfo-header')){
		elDiv = document.getElementById('nodeInfo-header')
		elDiv.innerHTML = headerStr;
	}else{
		elDiv = document.createElement('div');
		elDiv.id = 'nodeInfo-header';
		elDiv.innerHTML = headerStr;
		this.container.appendChild(elDiv);
	}
}

WfNodeInfo.prototype.refresh = function(){
	if(!this.editorUi.isFromWfForm){
		this.drawHeader();
		this.drawFoder();
		this.nodeActions();
	}
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
	for(var i = 0 ; i<cells.length;++i){
		if(cells[i].style.indexOf('fillColor=none;') != -1 && cells[i].style.indexOf('connectable=0;') != -1){ //区域分组
			graph.orderCells(true)
		}
		if(cells[i] instanceof mxCell &&  cells.length==1 && !cells[i].isGroupArea ){ //点击选中节点 v.edge != 1 && 不是区域分组 并且有nodeId linkId(校验下nodeId为0的情况)
			if(cells[i].nodeId || cells[i].linkId){
				if(document.getElementById('nodeInfo-no-node1') != null){
					this.container.removeChild(document.getElementById('nodeInfo-no-node1'));
				}
				this.drawNodeDetail();
			}else{
				noNodeOrLinkId = true;
			}
			haveNode = true;
		}
	}
	if(!haveNode){//
		this.renderWorkdlowItem();
	}
	if(haveNode && noNodeOrLinkId){
		this.renderWorkdlowItem();
		if(document.getElementById('nodeInfo-detail-shouldSaveFirst') != null){
			var re_elP = document.getElementById('nodeInfo-detail-shouldSaveFirst');
			this.container.removeChild(re_elP);
		}
		if(document.getElementById('nodeInfo-detail-nodeLinkDetail') != null){
			var _elDiv = document.getElementById('nodeInfo-detail-nodeLinkDetail');
			_elDiv.style.display = 'none';
			// this.container.removeChild(_elDiv);
		}
		var _elP = document.createElement('p');
		_elP.id = 'nodeInfo-detail-shouldSaveFirst';
		_elP.innerHTML = '温馨提示：需要先保存流程图才能对新增节点和出口进行详细属性设置！';
		this.container.appendChild(_elP);
	}
	if(!haveNode || noNodeOrLinkId){
		if(document.getElementById('nodeName-container')){
			var nodeNameContainer = document.getElementById('nodeName-container');
			document.body.removeChild(nodeNameContainer);
		}
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
		var _elDiv = document.getElementById('nodeInfo-node-detail');
		// this.container.removeChild(_elDiv); // 会报react minify错 找不到元素了
		_elDiv.style.display = 'none';
	}
	if(elP == null){
		elP = document.createElement('p');
		var elSpanLeft = document.createElement('span');
		var elSpanRight = document.createElement('div');
		elP.id = 'nodeInfo-no-node1';
		elP.className = 'nodeInfo-detail-item';
		elSpanLeft.className = 'detail-item-left detail-item-span';
		elSpanRight.className = 'detail-item-right detail-item-span';
		elP.appendChild(elSpanLeft);
		elP.appendChild(elSpanRight);
		
		elSpanLeft.innerHTML = '流程名称';
		elSpanRight.innerHTML = _workflowDetailDatas&&_workflowDetailDatas.workflowDatas&&_workflowDetailDatas.workflowDatas.workflowName || 'workflowName';

		this.container.appendChild(elP);
	}else{
		elP.childNodes[1].innerHTML = _workflowDetailDatas&&_workflowDetailDatas.workflowDatas&&_workflowDetailDatas.workflowDatas.workflowName || 'workflowName';
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
		var mapDatas = null;
		if(isEage){
			mapDatas = _workflowDetailDatas.linkDatas || {};
		}else{
			mapDatas = _workflowDetailDatas.nodeDatas || {};
		}
		for(var i in mapDatas){
			if((!isEage && i == nowCell.nodeId) || (isEage && i == nowCell.linkId)){
				detailDatas = mapDatas[i];
			}
		}
	}

	if(document.getElementById('nodeInfo-node-detail') != null){
		var _elDiv = document.getElementById('nodeInfo-node-detail');
		this.container.removeChild(_elDiv);
	}

	var nodeDetailArr = [
		{label:'节点名称',value:'',key:'name'},
		{label:'操作者',value:'',key:'operators'},
		{label:'表单内容',value:'',key:'formContent'},
		{label:'操作菜单',value:'',key:'hasCusRigKey'},
		{label:'节点前附加操作',value:'',key:'hasNodeBefAddOpr'},
		{label:'节点后附加操作',value:'',key:'hasNodeAftAddOpr'},
		{label:'签字意见设置',value:'',key:'hasOperateSign'},
		{label:'标题显示设置',value:'',key:'hasOperateTitle'},
		{label:'子流程设置',value:'',key:'hasOperateSubwf'},
		{label:'流程异常处理',value:'',key:'hasOperateException'},
		// {label:'节点字段校验',value:'',key:'hasNodePro'}, //暂时去掉，功能未找到
		{label:'类型',value:'',key:'changeNodeType'},
	];
	if(nowCell.nodeAttriBute && (nowCell.nodeAttriBute == 3||nowCell.nodeAttriBute == 4||nowCell.nodeAttriBute == 5)){//分支合并节点
		nodeDetailArr.push(
			{label:'合并类型',value:'',key:'branchToOneType'}
		);
		nodeDetailArr.push({label:nowCell.nodeAttriBute == 5 ? '通过比例（%）' : 
					nowCell.nodeAttriBute == 4 ? '指定通过分支' : '通过分支数合并',
			value:'',key:'branchToOneSubType'});
	}
	var linkDetailArr = [
		{label:'出口名称',value:'',key:'name'},
		{label:'目标节点',value:'',key:'targetCell'},
		{label:'生成编号',value:'',key:'isBuildCode'},
		{label:'条件',value:'',key:'hasCondition'},
		{label:'附加规则',value:'',key:'hasRole'},
		{label:'出口提示信息',value:'',key:'remindMsg'}
	];
	if(isEage && nowCell.source && nowCell.source.nodeType == '1'){//添加审批节点退回操作(出口 && 起始点是审批节点)
		linkDetailArr.splice(2,0,{label:'是否退回',value:'',key:'linkNeedBack'});
	}
	var labelShowDatas = isEage ? linkDetailArr : nodeDetailArr;
	var elDiv = document.createElement('div');
	elDiv.id = 'nodeInfo-node-detail';

	var elNodeLinkDetail;
	elNodeLinkDetail = document.createElement('div');
	elNodeLinkDetail.id = 'nodeInfo-detail-nodeLinkDetail';
	for(var i = 0 ; i<labelShowDatas.length;++i){
		var item = this.createNodeItem(isEage,labelShowDatas[i],detailDatas,nowCell);
		item&&elNodeLinkDetail.appendChild(item);
	}
	elDiv.appendChild(elNodeLinkDetail);
	this.container.appendChild(elDiv);
}
/**
创建节点信息 || 出口信息的每项信息
 */
WfNodeInfo.prototype.createNodeItem = function(isEage,v,detailDatas,nowCell){
	var elP = document.createElement('p');
	var elSpanLeft = document.createElement('span');
	var elSpanRight = document.createElement('div');

	elP.className = 'nodeInfo-detail-item';
	elSpanLeft.className = 'detail-item-left detail-item-span';
	elSpanRight.className = "detail-item-right detail-item-span "+(
		v.key === 'operators' || v.key === 'name' || v.key === 'targetCell' || v.key === 'isBuildCode' ||
		 v.key === 'remindMsg' || v.key === 'changeNodeType' || v.key === 'branchToOneType' || v.key === 'branchToOneSubType' 
		   ? 'isEcComs-item':'');
	/**
	//类型：处理和审批类型互换 1审批 2  处理
	/类型单独判断
	
	*/
	if(v.key === 'changeNodeType'){
		if(nowCell.nodeType == 1 || nowCell.nodeType == 2 || nowCell.nodeAttriBute==1 || nowCell.nodeAttriBute==2 ||
		(nowCell.nodeType == 3 &&(nowCell.nodeAttriBute==3 || nowCell.nodeAttriBute==4 || nowCell.nodeAttriBute==5))){
			var operatorArea = document.createElement('div');
			operatorArea.id = 'changeNodeType-container';
			elSpanRight.appendChild(operatorArea);

			var _sb = this;
			setTimeout(function() {
				_sb.createChangeNodeTypeElement(isEage,v.key,detailDatas,nowCell);
			}, 0);
		}else{
			return false;
		}
	}
	// 
	if(v.key === 'name'){//节点名称 ||  出口名称
		var operatorArea
		if(document.getElementById('nodeName-container')){
			operatorArea = document.getElementById('nodeName-container');
			operatorArea.style.display = 'block';
		}else{
			operatorArea = document.createElement('div');
			operatorArea.id = 'nodeName-container';
			// elSpanRight.appendChild(operatorArea);
			operatorArea.style.position = 'absolute';
			operatorArea.style.zIndex = '10';
			operatorArea.style.top = '47px';
			operatorArea.style.right = '10px';
			operatorArea.style.width = '110px';
			document.body.appendChild(operatorArea);
		}
		var _sb = this;
		setTimeout(function() {
			_sb.createNodeNameElement(isEage,v.key,detailDatas,nowCell);
		}, 0);

	}else if(v.key === 'operators'){ //操作者
		var operatorArea = document.createElement('div');
		operatorArea.id = 'operators-container';
		elSpanRight.appendChild(operatorArea);

		var _sb = this;
		setTimeout(function(){
			_sb.createOperatorElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'branchToOneType'){ //合并类型 （分叉合并节点）
		var branchToOneTypeArea = document.createElement('div');
		branchToOneTypeArea.id = 'branchToOneType-container';
		elSpanRight.appendChild(branchToOneTypeArea);

		var _sb = this;
		setTimeout(function() {
			_sb.createBranchToOneTypeElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'branchToOneSubType'){ //合并类型 子项详细设置（分叉合并节点）
		var branchToOneSubType = document.createElement('div');
		branchToOneSubType.id = 'branchToOneSubType-container';
		elSpanRight.appendChild(branchToOneSubType);

		var _sb = this;
		setTimeout(function() {
			_sb.createBranchToOneTypeSubElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'targetCell'){//出口-目标节点
		var operatorArea = document.createElement('div');
		operatorArea.id = 'targetCell-container';
		elSpanRight.appendChild(operatorArea);

		var _sb = this;
		setTimeout(function() {
			_sb.createTargetNodeElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'isBuildCode'){//出口-生成编号
		var operatorArea = document.createElement('div');
		operatorArea.id = 'isBuildCode-container';
		elSpanRight.appendChild(operatorArea);

		var _sb = this;
		setTimeout(function() {
			_sb.createBuildCodeElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'linkNeedBack'){//出口-审批-是否退回
		var operatorArea = document.createElement('div');
		operatorArea.id = 'linkNeedBack-container';
		elSpanRight.appendChild(operatorArea);

		var _sb = this;
		setTimeout(function() {
			_sb.createLinkNeedBackElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'remindMsg'){//出口-出口提示信息
		var operatorArea = document.createElement('div');
		operatorArea.id = 'remindMsg-container';
		elSpanRight.appendChild(operatorArea);

		var _sb = this;
		setTimeout(function(){
			_sb.createRemindMsgElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'formContent'){//节点-表单内容
		var formContentArea = document.createElement('a');
		formContentArea.innerHTML = detailDatas[v.key];
		// formContentArea.className = 'icon-workflow-shezhi';
		formContentArea.onclick = this.createDetailDialog.bind(this,v.key,v.label,nowCell.nodeId?nowCell.nodeId:nowCell.linkId,'','',isEage);
		elSpanRight.appendChild(formContentArea);
	}else{
		if(v.key !== 'changeNodeType'){
			var checkSpanIcon = document.createElement('span');
			checkSpanIcon.className = 'icon-workflow-shezhi';
			checkSpanIcon.onclick = this.createDetailDialog.bind(this,v.key,v.label,nowCell.nodeId?nowCell.nodeId:nowCell.linkId,'','',isEage);
			elSpanRight.appendChild(checkSpanIcon);
			if(detailDatas[v.key] == 'true'){//已经设置打√
				var checkSpanIcon = document.createElement('span');
				checkSpanIcon.className = 'icon-workflow-duigou';
				elSpanRight.appendChild(checkSpanIcon);
			}
		}
	}
	
	elSpanLeft.innerHTML = v.label;

	elP.appendChild(elSpanLeft);
	elP.appendChild(elSpanRight);

	return elP;
}
/**
合并节点，分叉合并类型
 */
WfNodeInfo.prototype.createBranchToOneTypeElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaSelect = window.ecCom.WeaSelect;
	//(nowCell.nodeAttriBute == 3||nowCell.nodeAttriBute == 4||nowCell.nodeAttriBute == 5)
	var selectOptions = [
		{key: "3",selected: nowCell.nodeAttriBute == 3,showname: "通过分支数"},
		{key: "4",selected: nowCell.nodeAttriBute == 4,showname: "指定通过分支"},
		{key: "5",selected: nowCell.nodeAttriBute == 5,showname: "比例合并"},
	]
	var sb = this;
	var edges = nowCell.edges || [] , typeComsViewAttr = 2;
	for(var i = 0 ; i<edges.length;++i){
		if(edges[i].linkId == null || edges[i].linkId == undefined || edges[i].linkId == ''){
			typeComsViewAttr = 1;
		}
	}
	
	ReactDOM.render(
		React.createElement(WeaSelect,
		{
			viewAttr:typeComsViewAttr,
			options:selectOptions,
			onChange:function(value, showname){
				nowCell.nodeAttriBute = value;
				sb.refresh();
			}
		}),
		document.getElementById("branchToOneType-container")
	);
}
/**
合并节点，分叉合并类型 子项的设置详细设置项
 */
WfNodeInfo.prototype.createBranchToOneTypeSubElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaSelect = window.ecCom.WeaSelect;
	var WeaInput = window.ecCom.WeaInput;
	// nowCell.edges &&  //(nowCell.nodeAttriBute == 3||nowCell.nodeAttriBute == 4||nowCell.nodeAttriBute == 5)
	var selectOptions = [];
	if(nowCell.nodeAttriBute == 4 && nowCell.edges && nowCell.edges.length>0){
		var edges = nowCell.edges;
		for(var i = 0 ; i<edges.length;++i){
			if(edges[i].target.id == nowCell.id){
				var obj = {key:edges[i].id,selected: false,showname: edges[i].value || ('出口'+edges[i].id)};
				selectOptions.push(obj);
			}
		}
	}
	if(nowCell.nodeAttriBute == 4 && nowCell.targetBranchValue && nowCell.targetBranchValue.indexOf('link_')>-1){//初次从后端返回的value : link_1,link_2,link_3
		var valArr = nowCell.targetBranchValue.split(',');
		var linkIds = [];
		for(var i = 0 ; i<valArr.length;++i){
			linkIds.push(Number(valArr[i].split('_')[1]));
		}
		var xmlIds = [];

		var startX = graph.minimumGraphSize.x;
		var startY = graph.minimumGraphSize.y;
		var graphWidth = graph.minimumGraphSize.width;
		var graphHeight = graph.minimumGraphSize.height;
		var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);

		for(var i = 0 ; i<allCells.length;++i){
			if(allCells[i].edge && linkIds.indexOf(Number(allCells[i].linkId))>-1){//是edge,并且linkId存在targetBranchValue内
				xmlIds.push(allCells[i].id);
			}
		}
		nowCell.targetBranchValue = xmlIds.join(',');
	}

	var edges = nowCell.edges || [] , typeComsViewAttr = 2;
	for(var i = 0 ; i<edges.length;++i){
		if(edges[i].linkId == null || edges[i].linkId == undefined || edges[i].linkId == ''){
			typeComsViewAttr = 1;
		}
	}

	var nowComs = nowCell.nodeAttriBute == 4 ? WeaSelect : WeaInput;
	var nowParams = nowCell.nodeAttriBute == 4 ? {
		multiple : true,
		viewAttr:typeComsViewAttr,
		value:nowCell.targetBranchValue || '',
		options:selectOptions,
		onChange:function(value, showname){
			nowCell.targetBranchValue = value;
		}
	} : {//通过分支数和比例合并组件参数
		viewAttr:typeComsViewAttr,
		value:nowCell.nodeAttriBute == 3 ? (nowCell.passBranchNum || '0') : (nowCell.proportMerge || '0'),
		onChange:function(value){
			value > 100 ? value = 100 : '';
			nowCell.nodeAttriBute == 3 ? nowCell.passBranchNum = value : nowCell.proportMerge = value ;
		}
	};
	ReactDOM.render(
		React.createElement(nowComs,nowParams),
		document.getElementById("branchToOneSubType-container")
	);
}
/**
类型切换：处理-审批（分叉其实点多一个 创建 选项；合并节点多一个 归档 选项）
1审批 2  处理
 */
WfNodeInfo.prototype.createChangeNodeTypeElement = function(isEage,key,detailDatas,nowCell){
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaSelect = window.ecCom.WeaSelect;

	var startX = graph.minimumGraphSize.x;
	var startY = graph.minimumGraphSize.y;
	var graphWidth = graph.minimumGraphSize.width;
	var graphHeight = graph.minimumGraphSize.height;
	var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);

	var options = [
		{key:'2',selected:nowCell.nodeType==2,showname:'处理'},
		{key:'1',selected:nowCell.nodeType==1,showname:'审批'},
		];
	if(nowCell.nodeAttriBute == 1){//分叉起始点
		options.unshift({key:'0',selected:nowCell.nodeType==0,showname:'创建'});
	}else if(nowCell.nodeAttriBute == 3 || nowCell.nodeAttriBute == 4 || nowCell.nodeAttriBute == 5){//合并节点 3 通过分支数，4指定分支，5比例合并
		options.unshift({key:'3',selected:nowCell.nodeType==3,showname:'归档'});
	}
	var edges = nowCell.edges || [] , typeComsViewAttr = 2;
	for(var i = 0 ; i<edges.length;++i){
		if(edges[i].linkId == null || edges[i].linkId == undefined || edges[i].linkId == ''){
			typeComsViewAttr = 1;
		}
	}
	ReactDOM.render(
		React.createElement(WeaSelect,
		{
			viewAttr:typeComsViewAttr,
			options:options,
			onChange:function(value, showname){
				var haveStartNode = false;
				for(var i = 0 ; i<allCells.length;++i){
					if(!allCells[i].edge && allCells[i].nodeType == 0){
						haveStartNode = true;
					}
				}
				if(haveStartNode && value == 0){
					wfModal.warning({
						title: wfGetLabel(131329, "信息确认"),
						content:'只能有一个创建节点！',
						okText: wfGetLabel(83446, "确定"),
						onOk:function(){},
					});
				}else{
					model.beginUpdate();
					try
					{
						if(value == 1 && nowCell.nodeType!=1){
							var newStyle = '';
							nowCell.style.indexOf('rounded=0;') != -1 ? newStyle = nowCell.style.replace(/rounded=0;/,'rhombus;') : 
							nowCell.style.indexOf('shape=mxgraph.flowchart.terminator;') != -1 ? newStyle = nowCell.style.replace(/shape=mxgraph.flowchart.terminator;/,'rhombus;') : '';
							var arr = newStyle.split(';');
							for(var i = 0 ; i<arr.length;++i){
								if((arr[i].indexOf('icon-workflow-chuangjian')>=0 && arr[i].indexOf('icon-workflow-fencha')>=0) || 
									(arr[i].indexOf('icon-workflow-guidang')>=0 && arr[i].indexOf('icon-workflow-hebing')>=0)){
									var obj = JSON.parse(arr[i].split('=')[1]);
									delete obj.right;
									arr[i] = "icons="+JSON.stringify(obj);
								}
							}
							model.setStyle(nowCell, arr.join(';'));
						}else if(value == 2 && nowCell.nodeType!=2){
							var newStyle = '';
							nowCell.style.indexOf('rhombus;') != -1 ? newStyle = nowCell.style.replace(/rhombus;/,'rounded=0;') : 
							nowCell.style.indexOf('shape=mxgraph.flowchart.terminator;') != -1 ? newStyle = nowCell.style.replace(/shape=mxgraph.flowchart.terminator;/,'rounded=0;') : '';
							var arr = newStyle.split(';');
							for(var i = 0 ; i<arr.length;++i){
								if((arr[i].indexOf('icon-workflow-chuangjian')>=0 && arr[i].indexOf('icon-workflow-fencha')>=0) || 
									(arr[i].indexOf('icon-workflow-guidang')>=0 && arr[i].indexOf('icon-workflow-hebing')>=0)){
									var obj = JSON.parse(arr[i].split('=')[1]);
									delete obj.right;
									arr[i] = "icons="+JSON.stringify(obj);
								}
							}
							model.setStyle(nowCell, arr.join(';'));
						}else if(value == 0 && nowCell.nodeType!=0){//创建
							var newStyle = '';
							nowCell.style.indexOf('rounded=0;') != -1 ? newStyle = nowCell.style.replace(/rounded=0;/,'shape=mxgraph.flowchart.terminator;') : 
							nowCell.style.indexOf('rhombus;') != -1 ? newStyle = nowCell.style.replace(/rhombus;/,'shape=mxgraph.flowchart.terminator;') : '';
							var arr = newStyle.split(';');
							for(var i = 0 ; i<arr.length;++i){
								if(arr[i].indexOf('icons')>=0){
									var obj = JSON.parse(arr[i].split('=')[1]);
									obj['left'] = 'icon-workflow-fencha';
									obj['right'] = 'icon-workflow-chuangjian';
									arr[i] = "icons="+JSON.stringify(obj);
								}
							}
							model.setStyle(nowCell, arr.join(';'));
						}else if(value == 3 && nowCell.nodeType!=3){//归档
							var newStyle = '';
							nowCell.style.indexOf('rounded=0;') != -1 ? newStyle = nowCell.style.replace(/rounded=0;/,'shape=mxgraph.flowchart.terminator;') : 
							nowCell.style.indexOf('rhombus;') != -1 ? newStyle = nowCell.style.replace(/rhombus;/,'shape=mxgraph.flowchart.terminator;') : '';
							var arr = newStyle.split(';');
							for(var i = 0 ; i<arr.length;++i){
								if(arr[i].indexOf('icons')>=0){
									var obj = JSON.parse(arr[i].split('=')[1]);
									obj['left'] = 'icon-workflow-hebing';
									obj['right'] = 'icon-workflow-guidang';
									arr[i] = "icons="+JSON.stringify(obj);
								}
							}
							model.setStyle(nowCell, arr.join(';'));
						}
						nowCell.nodeType = value;
					}
					finally
					{
						model.endUpdate();
						graph.refresh();
					}
				}
				
			}
		}),
		document.getElementById("changeNodeType-container")
	);
}
/**
创建出口-目标节点
 */
WfNodeInfo.prototype.createTargetNodeElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaSelect = window.ecCom.WeaSelect;

	var startX = graph.minimumGraphSize.x;
	var startY = graph.minimumGraphSize.y;
	var graphWidth = graph.minimumGraphSize.width;
	var graphHeight = graph.minimumGraphSize.height;
	var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);

	var cellsExceptEdges = [];
	for(var i = 0 ; i<allCells.length;++i){
		if(nowCell.source.nodeAttriBute == 2 && !allCells[i].edge){//分叉中间点
			if(allCells[i].nodeAttriBute == 2 || (allCells[i].nodeAttriBute == 3 || allCells[i].nodeAttriBute == 4 || allCells[i].nodeAttriBute == 5)  ){//中间节点 || 合并节点
				cellsExceptEdges.push(allCells[i]);
			}
		}else if((nowCell.source.nodeAttriBute == 3 || nowCell.source.nodeAttriBute == 4 || nowCell.source.nodeAttriBute == 5) && !allCells[i].edge ){//合并节点
			if(allCells[i].nodeAttriBute != 2){//不能是分叉中间点
				cellsExceptEdges.push(allCells[i]);
			}
		}
		else{
			if(!allCells[i].edge && allCells[i].nodeAttriBute != 2){//allCells[i].id != nowCell.source.id不能是分叉中间点
				cellsExceptEdges.push(allCells[i]);
			}
		}
	}
	
	var selectOptions = [];
	for(var i = 0 ; i<cellsExceptEdges.length;++i){
		var obj = {};
		obj['key'] = ''+cellsExceptEdges[i].id;
		obj['selected'] = cellsExceptEdges[i].id == nowCell.target.id ? true : false;
		obj['showname'] = wfFormatMultiLang(cellsExceptEdges[i].value);
		selectOptions.push(obj);
	}
	var sb = this;
	ReactDOM.render(
		React.createElement(WeaSelect,
		{
			options:selectOptions,
			onChange:function(value, showname){
				wfModal.confirm({
					title: wfGetLabel(131329, "信息确认"),
					content:'确定要将出口：'+nowCell.value+"的目标节点从"+nowCell.target.value+"改为"+showname+"吗？",
					okText: wfGetLabel(83446, "确定"),
					cancelText: wfGetLabel(31129, "取消"),
					onOk:function(){
						var selectItem = [];
						for(var i = 0 ; i<cellsExceptEdges.length;++i){
							if(cellsExceptEdges[i].id == value){
								selectItem.push(cellsExceptEdges[i]);
							}
						}
						model.beginUpdate();
						try
						{
							graph.cellConnected(nowCell,selectItem[0],false,{name:'',perimeter:true,point:{x:0,y:0.5}});
						}
						finally
						{
							model.endUpdate();
						}
					},
					onCancel:function(){sb.refresh();}
				});
				
			}
		}),
		document.getElementById("targetCell-container")
	);
}
/**
创建出口-是否退回
 */
WfNodeInfo.prototype.createLinkNeedBackElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaCheckbox = window.ecCom.WeaCheckbox;

	ReactDOM.render(
		React.createElement(WeaCheckbox,
		{
			value:nowCell.isreject?nowCell.isreject:false,
			onChange:function(v){
				nowCell.isreject = v;
			}
		}),
		document.getElementById("linkNeedBack-container")
	);
}
/**
创建出口-生成编号
 */
WfNodeInfo.prototype.createBuildCodeElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaCheckbox = window.ecCom.WeaCheckbox;

	ReactDOM.render(
		React.createElement(WeaCheckbox,
		{
			value:nowCell.isBuildCode?nowCell.isBuildCode:detailDatas[key] == 'true' ? true : false,
			onChange:function(v){
				nowCell.isBuildCode = v;
			}
		}),
		document.getElementById("isBuildCode-container")
	);
}
/**
创建出口-出口提示信息
 */
WfNodeInfo.prototype.createRemindMsgElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaInput = window.ecCom.WeaInput;

	ReactDOM.render(
		React.createElement(WeaInput,
		{
			viewAttr:3,
			value:nowCell.exitInfo  ? nowCell.exitInfo  : detailDatas[key] ,
			inputType:"multilang",
			isBase64:true,
			layout:document.getElementById("remindMsg-container"),
			onBlur:function(v){
				nowCell.exitInfo = v;
			}
		}),
		document.getElementById("remindMsg-container")
	);
}
/**
创建节点名称元素
 */
WfNodeInfo.prototype.noNeedRefresh = false;//修改名称时 不刷新，刷新会将当前dom结构清楚 会出现一些问题
WfNodeInfo.prototype.createNodeNameElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var WeaInput = window.ecCom.WeaInput;
	var sb = this;

	if(isEage && (!nowCell.value)){
		nowCell.value = "出口"+nowCell.id; //给出口添加默认名称
	}
	ReactDOM.render(
		React.createElement(WeaInput,
		{
			viewAttr:3,
			value:nowCell.value ?  nowCell.value : detailDatas[key] ,
			inputType:"multilang",
			isBase64:true,
			layout:document.getElementById("nodeName-container"),
			onChange : function(v){
				sb.noNeedRefresh = true;
				if(v.trim() == ''){
					wfModal.warning({
						title: wfGetLabel(131329, "信息确认"),
						content:'节点名称不能为空！',
						okText: wfGetLabel(83446, "确定"),
						onOk:function(){},
					});
					// sb.nodeNameRef.refs.inputNormal.setValue(nowCell.value.trim());
				}else{
					model.beginUpdate();
					try
					{
						model.setValue(nowCell,v);
					}
					finally
					{
						model.endUpdate();
					}
				}
			},
			onBlur:function(v){
				
			},
			ref:function(ref){this.nodeNameRef = ref}
		}),
		document.getElementById("nodeName-container")
	);
}
/**
创建操作者元素
 */
WfNodeInfo.prototype.createOperatorElement = function(isEage,key,detailDatas,nowCell){
	var browserComs = window.ecCom.WeaBrowser;
	for(var i = 0 ; i < detailDatas.operatorGroups.length;++i){
		detailDatas.operatorGroups[i].name = 
		// `<a onclick="window.workflowUi.wfNodeInfo.createDetailDialog('operator','操作组',${nowCell.nodeId},${nowCell.nodeType},${detailDatas.operatorGroups[i].id},${nowCell}")>${wfFormatMultiLang(detailDatas.operatorGroups[i].name)}</a>`
		'<a onclick="window.workflowUi.wfNodeInfo.createDetailDialog('+"'operator',"+"'操作组','"+
		nowCell.nodeId+"','"+nowCell.nodeType+"','"+detailDatas.operatorGroups[i].id+"',"+isEage+')">'+
		wfFormatMultiLang(detailDatas.operatorGroups[i].name)+"</a>";//wfFormatMultiLang
	}
	var sb = this;
	ReactDOM.render(
		React.createElement(browserComs,
		{
			viewAttr : 1 ,
			hasAddBtn:true,
			isSingle:false,
			replaceDatas:detailDatas.operatorGroups || [],
			whiteBackground:true,
			hasBorder:true,
			addOnClick:function(){sb.createDetailDialog('operator','操作组',nowCell.nodeId,nowCell.nodeType,'-1',isEage)},
			layout:document.body,
		}),
		document.getElementById("operators-container")
	);	

}
/**
*绘制折叠展开按钮
*
*/
WfNodeInfo.prototype.drawFoder = function(){
	var elDiv;
	if(document.getElementById('nodeInfo-panel-folder')){
		elDiv = document.getElementById('nodeInfo-panel-folder');
	}else{
		elDiv = document.createElement('div');
    	elDiv.id = 'nodeInfo-panel-folder';
		// elDiv.innerHTML = '>';
		elDiv.style.background = 'url(/workflow/workflowDesign/images/hide.png)';
		this.container.appendChild(elDiv);

		elDiv.onclick = this.clickNodeFolder.bind(this,elDiv);
	}

}
WfNodeInfo.prototype.clickNodeFolder = function(elt){
	var wfEditor = this.editorUi.wfEditor;
	var diagramContainer = this.editorUi.diagramContainer;
	var wfPanelContainer = this.editorUi.wfPanelContainer;
	var graph = this.editorUi.editor.graph;
	var model = graph.model;

	this.nodePanelHide = !this.nodePanelHide;
	var wfTestPanel = document.getElementById('workflow-test-detail-panel');
	var vertSplit = document.getElementById('test-panel-split');
	if(wfTestPanel){
		this.nodePanelHide ? wfTestPanel.style.width = '100%' : wfTestPanel.style.width = 'calc(100% - 250px)' ;
	}
	if(vertSplit){
		this.nodePanelHide ? vertSplit.style.right = '0' : vertSplit.style.right = '250px';
	}
	//加与不加update都一样
	// model.beginUpdate();
	try
	{
		var rowCanvas = document.getElementById('wf-row-rule-canvas');
		var	colCanvas = document.getElementById('wf-col-rule-canvas');
		if(this.nodePanelHide){//隐藏 向右移动隐藏
			if(document.getElementById("nodeName-container")){
				document.getElementById("nodeName-container").style.display = 'none';
			}
			wfEditor.container.style.width = '100%';
			// diagramContainer.style.width = '100%';
			wfPanelContainer.style.width = '100%';
			rowCanvas ? rowCanvas.width = wfPanelContainer.clientWidth : '';

			graph.pageFormat.width = window.innerWidth-(graph.isRuleEnabled()?30:18);
			this.container.style.transform = 'translateX(240px)';
			elt.style.left = '-18px';
			elt.style.background = 'url(/workflow/workflowDesign/images/show.png)';
			// elt.innerHTML = '<';
		}else{//显示 向左移动显示
			if(document.getElementById("nodeName-container")){
				document.getElementById("nodeName-container").style.display = 'block';
			}
			this.container.style.transform = 'translateX(0)';
			elt.style.left = '-1px';
			elt.style.background = 'url(/workflow/workflowDesign/images/hide.png)';
			// elt.innerHTML = '>';
			wfEditor.container.style.width = 'calc(100% - 240px)';
			wfPanelContainer.style.width = 'calc(100% - 240px)';
			rowCanvas ? rowCanvas.width = wfPanelContainer.clientWidth : '';
			// diagramContainer.style.width = 'calc(100% - 240px)';
			graph.pageFormat.width = window.innerWidth - (graph.isRuleEnabled()?278:266);
		}
		graph.refresh();
	}
	finally
	{
		// model.endUpdate();
	}
	
}
/**
创建每项设置对应弹框
*/
var workflowDesignE9_dialog,workflowDesignE9_dialog_params={};
WfNodeInfo.prototype.createDetailDialog = function(key,modalName,nodeId,nodetype,groupid,isEage){
	var WeaTools = window.ecCom.WeaTools;
	var graph = this.editorUi.editor.graph;
	var startX = graph.minimumGraphSize.x;
	var startY = graph.minimumGraphSize.y;
	var graphWidth = graph.minimumGraphSize.width;
	var graphHeight = graph.minimumGraphSize.height;
	var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);
	var nowCell;
	for(var i = 0 ; i < allCells.length;++i){
		if(isEage){
			if(allCells[i].edge && allCells[i].linkId == nodeId){
				nowCell = allCells[i];
				break;
			}
		}else{
			if(!allCells[i].edge && allCells[i].nodeId == nodeId ){
				nowCell = allCells[i];
				break;
			}
		}
	}
	workflowDesignE9_dialog_params = {key:key,modalName:modalName,nodetype:nodetype,groupid:groupid,nowCell:nowCell};
	if(key == 'hasRole' || key == 'hasCondition'){
		workflowDesignE9_dialog_params['linkId'] = nodeId;
	}else{
		workflowDesignE9_dialog_params['nodeId'] = nodeId;
	}
	var _workflowDetailDatas = this.editorUi.editor.graph.workflowDetailDatas;
	var isCreate = nodetype == 0 ? 1 : '';
	/**
		*操作组 ：#/main/workflowengine/path/pathSet/operatorSet?isSingle=true&workflowId=&nodeid=&nodetype=&isCreate=&groupid=-1
		*操作菜单 : #/main/workflowengine/path/pathset/perationMenuSet?nodeid=284&workflowId=81&isRoute=true&_key=2r5y2t
		*表单内容 ： #/main/workflowengine/path/pathset/formcontent?nodeid=284&workflowId=81&isRoute=true&_key=6vyr0l
		*节点前附加操作 ： #/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId=9244&nodeId=11995&ispreoperator=1
		*节点后附加操作 ： #/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId=9244&nodeId=11995&ispreoperator=0
		*签字意见设置 : #/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=9604&nodeId=12459&type=sign&isSingle=true
		*标题显示设置 ： #/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=9604&nodeId=12457&type=title&isSingle=true
		*子流程设置 ： #/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=9604&nodeId=12456&type=subWf&isSingle=true
		*流程异常处理 ： #/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=9604&nodeId=12458&type=exception&isSingle=true
		*
		*附加规则 : #/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId=9244&linkId=20015
		条件 ： /formmode/interfaces/showconditionContent.jsp?design=1&rulesrc=1&formid=-953&isbill=1&linkid=26876&wfid=15406&isreject=&curtype=1
		*
		{label:'节点名称',value:'',key:'name'},
		{label:'操作者',value:'',key:'operators'},
		{label:'表单内容',value:'',key:'formContent'},
		{label:'操作菜单',value:'',key:'hasCusRigKey'},
		{label:'节点前附加操作',value:'',key:'hasNodeBefAddOpr'},
		{label:'节点后附加操作',value:'',key:'hasNodeAftAddOpr'},
		{label:'签字意见设置',value:'',key:'hasOperateSign'},
		{label:'标题显示设置',value:'',key:'hasOperateTitle'},
		{label:'子流程设置',value:'',key:'hasOperateSubwf'},
		{label:'流程异常处理',value:'',key:'hasOperateException'},
		{label:'节点字段校验',value:'',key:'hasNodePro'}
		
		{label:'条件',value:'',key:'hasCondition'},
		{label:'附加规则',value:'',key:'hasRole'},
	*/
	var workflowId = window.urlParams.workflowId || '';
	// 功能地址
	var urlObj = {
		'operator' : "#/main/workflowengine/path/pathSet/operatorSet?isSingle=true&workflowId="+workflowId+"&nodeid="+nodeId+"&nodetype="+nodetype+"&groupid="+groupid+"&isCreate="+isCreate+"&isClose4e9=true",
		'hasCusRigKey' : "#/main/workflowengine/path/pathset/perationMenuSet?nodeid="+nodeId+"workflowId="+workflowId+"&isRoute=true&isClose4e9=true&_key=2r5y2t",
		'formContent' : "#/main/workflowengine/path/pathset/formcontent?nodeid="+nodeId+"&workflowId="+workflowId+"&isRoute=true&isClose4e9=true&_key=6vyr0l",
		'hasNodeBefAddOpr' : "#/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId="+workflowId+"&nodeId="+nodeId+"&ispreoperator=1&isClose4e9=true",
		'hasNodeAftAddOpr' : "#/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId="+workflowId+"&nodeId="+nodeId+"&ispreoperator=0&isClose4e9=true",
		'hasOperateSign' : "#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId="+workflowId+"&nodeId="+nodeId+"&type=sign&isSingle=true&isClose4e9=true",
		'hasOperateTitle' : "#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId="+workflowId+"&nodeId="+nodeId+"&type=title&isSingle=true&isClose4e9=true",
		'hasOperateSubwf' : "#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId="+workflowId+"&nodeId="+nodeId+"&type=subWf&isSingle=true&isClose4e9=true",
		'hasOperateException' : "#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId="+workflowId+"&nodeId="+nodeId+"&type=exception&isSingle=true&isClose4e9=true",
		// 出口
		'hasRole' : "#/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId="+workflowId+"&linkId="+nodeId+"&isClose4e9=true",
		'hasCondition' : "/formmode/interfaces/showconditionContent.jsp?design=1&rulesrc=1&linkid="+nodeId+"&wfid="+workflowId+"&isreject=&curtype=1&formid="+_workflowDetailDatas.workflowDatas.formId+"&isbill="+_workflowDetailDatas.workflowDatas.isBill+"&isClose4e9=true"
	}
	if(urlObj[key]){
		var url = (key == 'hasCondition' ? '' : '/spa/workflow/static4engine/engine.html')+urlObj[key];

		/**
		var dialog = new window.top.Dialog();
        dialog.currentWindow = window;
        dialog.URL = dialogurl;
        dialog.Title = "收藏夹";
        dialog.Width = 550 ;
        dialog.Height = 600;
        dialog.Drag = true;
        dialog.show();
		 */
		if(key == 'hasCondition'){//出口条件暂时用老的弹框， e9弹框弹出jsp获取window有问题，导致获取不到当前dialog id
			var dialog = new window.top.Dialog();
			dialog.currentWindow = window;
			dialog.URL = url;
			dialog.Title = "出口条件";
			dialog.Width = 900 ;
			dialog.Height = 600;
			dialog.Drag = true;
			dialog.closeHandle = function(a){
				mxUtils.post('/api/workflow/layout/getRuleCondition', "nodelinkid="+nodeId, function(req)
				{
					var _request = req.request;
					var _response = _request.response;
					var _json = JSON.parse(_response);
					workflowUi.editor.graph.workflowDetailDatas.linkDatas[nodeId]['hasCondition'] = _json.allcondition ? 'true' : 'false';
					nowCell.linkConditionInfo = _json.allcondition || '';
					workflowUi.wfNodeInfo.refresh();
				})
			};
			dialog.callback = function(datas){
				// console.log(datas,'datas');//linkConditionInfo
			}
			dialog.show();
		}else{
			workflowDesignE9_dialog = WeaTools.createDialog({
				title: modalName || 'test',
				moduleName: "workflow",
				url: url,
				style: {width:900, height:600},
				callback: function(con){
					console.log(con)
				},
				onCancel: function(){
					console.log('cancel')
				}
			});
			workflowDesignE9_dialog.show();
		}
	}

}
/**
*关闭e9弹框的回调
 */
function workflowDesign_callback(key,returnVal,needSyncNodes){
	// console.log(key,returnVal,needSyncNodes,'key,returnVal,needSyncNodes',workflowDesignE9_dialog_params);
	

	var isNode = true , id;
	if(workflowDesignE9_dialog_params.hasOwnProperty('linkId')){
		isNode = false;
		id = workflowDesignE9_dialog_params.linkId;
	}else{
		id = workflowDesignE9_dialog_params.nodeId;
	}
	if(key == 'operator'){//操作者
		var workflowId = window.urlParams.workflowId || '';
		mxUtils.post(WORKFLOW_GETDETAILINFO_PATH, "workflowId="+workflowId, function(req)
			{
				var request = req.request;
				var response = request.response;
				var json = JSON.parse(response);
				workflowUi.editor.graph.workflowDetailDatas = json;
				workflowUi.wfNodeInfo.refresh();
			}
		)
	}else{
		var workflowDetailDatas = workflowUi.editor.graph.workflowDetailDatas;
		if(key == 'showpreaddinoperate'){//节点前附加操作
			workflowDetailDatas.nodeDatas[id]['hasNodeBefAddOpr'] = returnVal;
			var nowCell = workflowDesignE9_dialog_params['nowCell'];
			checkIsChangCellIcon(nowCell,returnVal,'beforeNode');
		}else if(key == 'showaddinoperate_node'){//节点后附加操作
			workflowDetailDatas.nodeDatas[id]['hasNodeAftAddOpr'] = returnVal;
			var nowCell = workflowDesignE9_dialog_params['nowCell'];
			checkIsChangCellIcon(nowCell,returnVal,'nodeAfter');
		}else if(key == 'showNodeAttrOperate_sign'){//签字意见设置
			workflowDetailDatas.nodeDatas[id]['hasOperateSign'] = returnVal;
		}else if(key == 'showNodeAttrOperate_title'){//标题显示设置
			workflowDetailDatas.nodeDatas[id]['hasOperateTitle'] = returnVal;
		}else if(key == 'showNodeAttrOperate_subWorkflow'){//子流程设置
			workflowDetailDatas.nodeDatas[id]['hasOperateSubwf'] = returnVal;
		}else if(key == 'showNodeAttrOperate_exceptionhandle'){//流程异常处理
			workflowDetailDatas.nodeDatas[id]['hasOperateException'] = returnVal;
		}else if(key == 'formContent'){//表单内容
			workflowDetailDatas.nodeDatas[id]['formContent'] = returnVal;
		}else if(key == 'showButtonNameOperate'){//操作菜单
			workflowDetailDatas.nodeDatas[id]['hasCusRigKey'] = returnVal;
		}else if(key == 'showaddinoperate_link'){//出口附加规则
			workflowDetailDatas.linkDatas[id]['hasRole'] = returnVal;
		}
		workflowUi.editor.graph.workflowDetailDatas = workflowDetailDatas;

		workflowUi.wfNodeInfo.refresh();
	}
	key != 'formContent' && workflowDesignE9_dialog && workflowDesignE9_dialog.close();
}
function checkIsChangCellIcon(cell,returnVal,pos){//现在不能同时出现icon
	var graph = workflowUi.editor.graph;
	var model = graph.model;
	
	var newStyle = cell.style,cellStyle = cell.style;
	// if((returnVal=='true' && cellStyle.indexOf('icons=')<0) || (cellStyle.indexOf('icons=')>-1 && returnVal=='false')){ // 本来没icon&&返回值为false，有icon返回值为true 不触发渲染
		model.beginUpdate();
		try
		{
			if(returnVal == 'true' && cellStyle.indexOf('icons=')<0){
				newStyle = cellStyle + 'icons={"'+pos+'":'+(pos=='"beforeNode"'?'"icon-workflow-caozuoqian"':'"icon-workflow-caozuohou"')+"};";
			}else if(returnVal =='false' && cellStyle.indexOf('icons=')>-1){
				var arr = cellStyle.split(';');
				for(var i = 0 ; i < arr.length;++i){
					if(arr[i].indexOf('icons=') >-1 ){
						//v= ic
						var iconObj = JSON.parse(arr[i].split('=')[1]);
						for(var key in iconObj){
							if(key == pos){
								delete iconObj[key];
							}
						}
						if(Object.keys(iconObj).length == 0){
							arr.splice(i,1);
						}else{
							arr[i] = "icons="+JSON.stringify(iconObj);
						}
					}
				}
				newStyle = arr.join(';');
			}else if(returnVal == 'true' && cellStyle.indexOf('icons=')>-1){//两个icon需同时存在
				var arr = cellStyle.split(';');
				for(var i = 0 ; i < arr.length;++i){
					if(arr[i].indexOf('icons=') >-1 ){
						//v= ic
						var iconObj = JSON.parse(arr[i].split('=')[1]);
						if(!iconObj[pos]){//未存在当前icon
							iconObj[pos] = (pos=='beforeNode'?'icon-workflow-caozuoqian':'icon-workflow-caozuohou');
						}
						arr[i] = "icons="+JSON.stringify(iconObj);
						
					}
				}
				newStyle = arr.join(';');
			}
			model.setStyle(cell, newStyle);
		}
		finally
		{
			model.endUpdate();
			graph.refresh();
		}
	// }
}