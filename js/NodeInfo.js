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
	this.nodeNameRef = null;
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
		// this.container.removeChild(_elDiv); // 会报react minify错 找不到元素了
		_elDiv.style.display = 'none';
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
		{label:'表单内容',value:'',key:'formContent'},
		{label:'操作菜单',value:'',key:'hasCusRigKey'},
		{label:'节点前附加操作',value:'',key:'hasNodeBefAddOpr'},
		{label:'节点后附加操作',value:'',key:'hasNodeAftAddOpr'},
		{label:'签字意见设置',value:'',key:'hasOperateSign'},
		{label:'标题显示设置',value:'',key:'hasOperateTitle'},
		{label:'子流程设置',value:'',key:'hasOperateSubwf'},
		{label:'流程异常处理',value:'',key:'hasOperateException'},
		{label:'节点字段校验',value:'',key:'hasNodePro'},
		{label:'类型',value:'',key:'changeNodeType'},
	];
	var linkDetailArr = [
		{label:'出口名称',value:'',key:'name'},
		{label:'目标节点',value:'',key:'targetCell'},
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
		item&&elNodeLinkDetail.appendChild(item);
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
	elSpanRight.className = `detail-item-right detail-item-span 
		${v.key === 'operators' || v.key === 'name' || v.key === 'targetCell' || v.key === 'isBuildCode' || v.key === 'remindMsg'  ? 'isEcComs-item':''}`;
	/**
	//类型：处理和审批类型互换 1审批 2  处理
	/类型单独判断
	
	*/
	if(v.key === 'changeNodeType'){
		if(nowCell.nodeType == 1 || nowCell.nodeType == 2 || nowCell.nodeAttriBute==1 || nowCell.nodeAttriBute==2 ||nowCell.nodeAttriBute==3){
			let operatorArea = document.createElement('div');
			operatorArea.id = 'changeNodeType-container';
			elSpanRight.appendChild(operatorArea);

			let _sb = this;
			setTimeout(() => {
				_sb.createChangeNodeTypeElement(isEage,v.key,detailDatas,nowCell);
			}, 0);
		}else{
			return false;
		}
	}
	// 
	if(v.key === 'name'){//节点名称 ||  出口名称
		let operatorArea = document.createElement('div');
		operatorArea.id = 'nodeName-container';
		elSpanRight.appendChild(operatorArea);

		let _sb = this;
		setTimeout(() => {
			_sb.createNodeNameElement(isEage,v.key,detailDatas,nowCell);
		}, 0);

	}else if(v.key === 'operators'){ //操作者
		let operatorArea = document.createElement('div');
		operatorArea.id = 'operators-container';
		elSpanRight.appendChild(operatorArea);

		let _sb = this;
		setTimeout(() => {
			_sb.createOperatorElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'targetCell'){//出口-目标节点
		let operatorArea = document.createElement('div');
		operatorArea.id = 'targetCell-container';
		elSpanRight.appendChild(operatorArea);

		let _sb = this;
		setTimeout(() => {
			_sb.createTargetNodeElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'isBuildCode'){//出口-生成编号
		let operatorArea = document.createElement('div');
		operatorArea.id = 'isBuildCode-container';
		elSpanRight.appendChild(operatorArea);

		let _sb = this;
		setTimeout(() => {
			_sb.createBuildCodeElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'remindMsg'){//出口-出口提示信息
		let operatorArea = document.createElement('div');
		operatorArea.id = 'remindMsg-container';
		elSpanRight.appendChild(operatorArea);

		let _sb = this;
		setTimeout(() => {
			_sb.createRemindMsgElement(isEage,v.key,detailDatas,nowCell);
		}, 0);
	}else if(v.key === 'formContent'){//节点-表单内容
		var formContentArea = document.createElement('a');
		formContentArea.innerHTML = detailDatas[v.key];
		// formContentArea.className = 'icon-workflow-shezhi';
		formContentArea.onclick = this.createDetailDialog.bind(this,v.key,v.label,nowCell.nodeId?nowCell.nodeId:nowCell.linkId);
		elSpanRight.appendChild(formContentArea);
	}else{
		if(v.key !== 'changeNodeType'){
			var checkSpanIcon = document.createElement('span');
			checkSpanIcon.className = 'icon-workflow-shezhi';
			checkSpanIcon.onclick = this.createDetailDialog.bind(this,v.key,v.label,nowCell.nodeId?nowCell.nodeId:nowCell.linkId);
			elSpanRight.appendChild(checkSpanIcon);
		}
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
类型切换：处理-审批（分叉其实点多一个 创建 选项；合并节点多一个 归档 选项）
1审批 2  处理
 */
WfNodeInfo.prototype.createChangeNodeTypeElement = function(isEage,key,detailDatas,nowCell){
	let graph = this.editorUi.editor.graph;
	let model = graph.model;
	let WeaSelect = window.ecCom.WeaSelect;

	var startX = graph.minimumGraphSize.x;
	var startY = graph.minimumGraphSize.y;
	var graphWidth = graph.minimumGraphSize.width;
	var graphHeight = graph.minimumGraphSize.height;
	var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);

	let options = [
		{key:'2',selected:nowCell.nodeType==2 || true,showname:'处理'},
		{key:'1',selected:nowCell.nodeType==1,showname:'审批'},
		];
	if(nowCell.nodeAttriBute == 1){//分叉起始点
		options.unshift({key:'0',selected:false,showname:'创建'});
	}else if(nowCell.nodeAttriBute == 3){//合并节点
		options.unshift({key:'3',selected:false,showname:'归档'});
	}
	ReactDOM.render(
		React.createElement(WeaSelect,
		{
			options:options,
			onChange:(value, showname)=>{
				let haveStartNode = false;
				allCells.map(v=>{
					if(!v.edge && v.nodeType == 0){
						haveStartNode = true;
					}
				});
				if(haveStartNode){
					wfModal.warning({
						title: wfGetLabel(131329, "信息确认"),
						content:'只能有一个创建节点！',
						okText: wfGetLabel(83446, "确定"),
						onOk:()=>{},
					});
				}else{
					model.beginUpdate();
					try
					{
						if(value == 1){
							let newStyle = '';
							nowCell.nodeType == 2 ? newStyle = nowCell.style.replace(/rounded=0;/,'rhombus;') : '';
							model.setStyle(nowCell, newStyle);
						}else if(value == 2){
							let newStyle = '';
							nowCell.nodeType == 1 ? newStyle = nowCell.style.replace(/rhombus;/,'rounded=0;') : '';
							model.setStyle(nowCell, newStyle);
						}else if(value == 0){//创建
							let newStyle = '';
							nowCell.style.indexOf('rounded=0;') != 1 ? newStyle = nowCell.style.replace(/rounded=0;/,'shape=mxgraph.flowchart.terminator;') : 
							nowCell.style.indexOf('rhombus;') != 1 ? newStyle = nowCell.style.replace(/rhombus;/,'shape=mxgraph.flowchart.terminator;') : '';
							model.setStyle(nowCell, newStyle);
						}else if(value == 3){//归档
							let newStyle = '';
							nowCell.style.indexOf('rounded=0;') != 1 ? newStyle = nowCell.style.replace(/rounded=0;/,'shape=mxgraph.flowchart.terminator;') : 
							nowCell.style.indexOf('rhombus;') != 1 ? newStyle = nowCell.style.replace(/rhombus;/,'shape=mxgraph.flowchart.terminator;') : '';
							model.setStyle(nowCell, newStyle);
						}
						nowCell.nodeType = value;
					}
					finally
					{
						model.endUpdate();
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
	let WeaSelect = window.ecCom.WeaSelect;

	var startX = graph.minimumGraphSize.x;
	var startY = graph.minimumGraphSize.y;
	var graphWidth = graph.minimumGraphSize.width;
	var graphHeight = graph.minimumGraphSize.height;
	var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);
	var cellsExceptEdges = allCells.filter(v=>!v.edge && v.id != nowCell.source.id);
	
	let selectOptions = [];
	cellsExceptEdges.map((v,i)=>{
		let obj = {};
		obj['key'] = ''+v.id;
		obj['selected'] = v.id == nowCell.target.id ? true : false;
		obj['showname'] = wfFormatMultiLang(v.value);
		selectOptions.push(obj);
	})
	ReactDOM.render(
		React.createElement(WeaSelect,
		{
			options:selectOptions,
			onChange:(value, showname)=>{
				let selectItem = cellsExceptEdges.filter(v=>v.id == value);
				model.beginUpdate();
				try
				{
					graph.cellConnected(nowCell,selectItem[0],false,{name:'',perimeter:true,point:{x:0,y:0.5}});
				}
				finally
				{
					model.endUpdate();
				}
				console.log(cellsExceptEdges,'cellsExceptEdges',value, showname);
			}
		}),
		document.getElementById("targetCell-container")
	);
}
/**
创建出口-生成编号
 */
WfNodeInfo.prototype.createBuildCodeElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	let WeaCheckbox = window.ecCom.WeaCheckbox;

	ReactDOM.render(
		React.createElement(WeaCheckbox,
		{
			value:nowCell.isBuildCode?nowCell.isBuildCode:detailDatas[key] == 'true' ? true : false,
			onChange:(v)=>{
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
	let WeaInput = window.ecCom.WeaInput;

	ReactDOM.render(
		React.createElement(WeaInput,
		{
			viewAttr:3,
			value:nowCell.exitInfo  ? nowCell.exitInfo  : detailDatas[key] ,
			inputType:"multilang",
			isBase64:true,
			layout:document.getElementById("remindMsg-container"),
			onBlur:(v)=>{
				nowCell.exitInfo = v;
			}
		}),
		document.getElementById("remindMsg-container")
	);
}
/**
创建节点名称元素
 */
WfNodeInfo.prototype.createNodeNameElement = function(isEage,key,detailDatas,nowCell){
	
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	let WeaInput = window.ecCom.WeaInput;

	ReactDOM.render(
		React.createElement(WeaInput,
		{
			viewAttr:3,
			value:nowCell.value ?  nowCell.value : detailDatas[key] ,
			// inputType:"multilang",
			// isBase64:true,
			layout:document.getElementById("nodeName-container"),
			// onChange : (v)=>{
			// 	console.log(v,'----------')
			// },
			onBlur:(v)=>{
				if(v.trim() == ''){
					wfModal.warning({
						title: wfGetLabel(131329, "信息确认"),
						content:'节点名称不能为空！',
						okText: wfGetLabel(83446, "确定"),
						onOk:()=>{},
					});
					this.nodeNameRef.refs.inputNormal.setValue(nowCell.value.trim());
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
			ref:(ref)=>{this.nodeNameRef = ref}
		}),
		document.getElementById("nodeName-container")
	);
}
/**
创建操作者元素
 */
WfNodeInfo.prototype.createOperatorElement = function(isEage,key,detailDatas,nowCell){
	let browserComs = window.ecCom.WeaBrowser;
	detailDatas.operatorGroups.map((v,i)=>{
		detailDatas.operatorGroups[i].name = 
		`<a onclick="window.workflowUi.wfNodeInfo.createDetailDialog('operator','操作组',${nowCell.nodeId},${nowCell.nodeType},${v.id})">${wfFormatMultiLang(v.name)}</a>`;//wfFormatMultiLang
	});

	ReactDOM.render(
		React.createElement(browserComs,
		{
			viewAttr : 1 ,
			hasAddBtn:true,
			isSingle:false,
			replaceDatas:detailDatas.operatorGroups || [],
			whiteBackground:true,
			hasBorder:true,
			addOnClick:()=>{console.log('iniin');this.createDetailDialog('operator','操作组',nowCell.nodeId,nowCell.nodeType,'-1')},
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
/**
创建每项设置对应弹框
*/
var workflowDesignE9_dialog,workflowDesignE9_dialog_params={};
WfNodeInfo.prototype.createDetailDialog = function(key='',modalName='',nodeId='',nodetype='',groupid=''){
	var WeaTools = window.ecCom.WeaTools;
	workflowDesignE9_dialog_params = {key,modalName,nodetype,groupid};
	if(key == 'hasRole' || key == 'hasCondition'){
		workflowDesignE9_dialog_params['linkId'] = nodeId;
	}else{
		workflowDesignE9_dialog_params['nodeId'] = nodeId;
	}
	var _workflowDetailDatas = this.editorUi.editor.graph.workflowDetailDatas;
	let isCreate = nodetype == 0 ? 1 : '';
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
	let workflowId = window.urlParams.workflowId || '';
	// 功能地址
	let urlObj = {
		'operator' : `#/main/workflowengine/path/pathSet/operatorSet?isSingle=true&workflowId=${workflowId}&nodeid=${nodeId}&nodetype=${nodetype}
						&groupid=${groupid}&isCreate=${isCreate}&isClose4e9=true`,
		'hasCusRigKey' : `#/main/workflowengine/path/pathset/perationMenuSet?nodeid=${nodeId}&workflowId=${workflowId}&isRoute=true&isClose4e9=true&_key=2r5y2t`,
		'formContent' : `#/main/workflowengine/path/pathset/formcontent?nodeid=${nodeId}&workflowId=${workflowId}&isRoute=true&isClose4e9=true&_key=6vyr0l`,
		'hasNodeBefAddOpr' : `#/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId=${workflowId}&nodeId=${nodeId}&ispreoperator=1&isClose4e9=true`,
		'hasNodeAftAddOpr' : `#/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId=${workflowId}&nodeId=${nodeId}&ispreoperator=0&isClose4e9=true`,
		'hasOperateSign' : `#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=${workflowId}&nodeId=${nodeId}&type=sign&isSingle=true&isClose4e9=true`,
		'hasOperateTitle' : `#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=${workflowId}&nodeId=${nodeId}&type=title&isSingle=true&isClose4e9=true`,
		'hasOperateSubwf' : `#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=${workflowId}&nodeId=${nodeId}&type=subWf&isSingle=true&isClose4e9=true`,
		'hasOperateException' : `#/main/workflowengine/path/pathSet/nodeMore?_key=hsdkby&workflowId=${workflowId}&nodeId=${nodeId}&type=exception&isSingle=true&isClose4e9=true`,
		// 出口
		'hasRole' : `#/main/workflowengine/path/pathSet/addInOperate?isRoute=true&workflowId=${workflowId}&linkId=${nodeId}&isClose4e9=true`,
		'hasCondition' : `/formmode/interfaces/showconditionContent.jsp?design=1&rulesrc=1&linkid=${nodeId}&wfid=${workflowId}&isreject=&curtype=1
						&formid=${_workflowDetailDatas.formId}&isbill=${_workflowDetailDatas.isBill}&isClose4e9=true`
	}
	if(urlObj[key]){
		let url = `${key == 'hasCondition' ? '' : '/spa/workflow/static4engine/engine.html'}${urlObj[key]}`;
		workflowDesignE9_dialog = WeaTools.createDialog({
			title: modalName || 'test',
			moduleName: "workflow",
			url: url,
			style: {width:900, height:600},
			callback: (con) =>{
				console.log(con)
			},
			onCancel: () =>{
				console.log('cancel')
			}
		});
		workflowDesignE9_dialog.show();
	}

}
/**
*关闭e9弹框的回调
 */
function workflowDesign_callback(key,returnVal,needSyncNodes){
	// console.log(key,returnVal,needSyncNodes,'key,returnVal,needSyncNodes',workflowDesignE9_dialog_params);
	let isNode = true , id;
	if(workflowDesignE9_dialog_params.hasOwnProperty('linkId')){
		isNode = false;
		id = workflowDesignE9_dialog_params.linkId;
	}else{
		id = workflowDesignE9_dialog_params.nodeId;
	}
	if(key == 'operator'){//操作者
		let workflowId = window.urlParams.workflowId || '';
		mxUtils.post(WORKFLOW_GETDETAILINFO_PATH, `workflowId=${workflowId}`, function(req)
			{
				var request = req.request;
				var response = request.response;
				var json = JSON.parse(response);
				workflowUi.editor.graph.workflowDetailDatas = json;
				workflowUi.wfNodeInfo.refresh();
			}
		)
	}else{
		let workflowDetailDatas = workflowUi.editor.graph.workflowDetailDatas;
		if(key == 'showpreaddinoperate'){//节点前附加操作
			workflowDetailDatas.nodeDatas[id]['hasNodeBefAddOpr'] = returnVal;
		}else if(key == 'showaddinoperate_node'){//节点后附加操作
			workflowDetailDatas.nodeDatas[id]['hasNodeAftAddOpr'] = returnVal;
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
			workflowDetailDatas.nodeDatas[id]['hasRole'] = returnVal;
		}
		workflowUi.editor.graph.workflowDetailDatas = workflowDetailDatas;

		workflowUi.wfNodeInfo.refresh();
	}
	key != 'formContent' && workflowDesignE9_dialog && workflowDesignE9_dialog.close();
}