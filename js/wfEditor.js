var workflowUi;
function WfPanel(editorUi, container) {
    this.editorUi = editorUi;
    workflowUi = editorUi;
	this.container = container;
	var editor = editorUi.editor;
	var graph = editor.graph;

    this.palettes = new Object();
    // this.siderBar = new Sidebar(editorUi, container);
    this.showTooltips = true;
	this.graph = editorUi.createTemporaryGraph(this.editorUi.editor.graph.getStylesheet());
	this.graph.cellRenderer.antiAlias = false;
	this.graph.foldingEnabled = false;
	this.graph.container.style.visibility = 'hidden';
	document.body.appendChild(this.graph.container);
    this.init();
    // this.setTipInfoBtn();
    this.tipInfoDisplay = 'block';
    // 创建处理函数-----------------
    this.pointerUpHandler = mxUtils.bind(this, function()
	{
		this.showTooltips = true;
	});

    this.pointerMoveHandler = mxUtils.bind(this, function(evt)
	{
		var src = mxEvent.getSource(evt);
		
		while (src != null)
		{
			if (src == this.currentElt)
			{
				return;
			}
			
			src = src.parentNode;
		}
		
		this.hideTooltip();
	});
	this.pointerDownHandler = mxUtils.bind(this, function()
	{
		this.showTooltips = false;
		this.hideTooltip();
	});
    // Handles mouse leaving the window
	this.pointerOutHandler = mxUtils.bind(this, function(evt)
	{
		if (evt.toElement == null && evt.relatedTarget == null)
		{
			this.hideTooltip();
		}
	});
    // Enables tooltips after scroll
	mxEvent.addListener(container, 'scroll', mxUtils.bind(this, function()
	{
		this.showTooltips = true;
		this.hideTooltip();
	}));
	

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerup' : 'mouseup', this.pointerUpHandler);
	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', this.pointerMoveHandler);
    mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown', this.pointerDownHandler);
    mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerout' : 'mouseout', this.pointerOutHandler); 

	this.update = mxUtils.bind(this, function(sender, evt)
	{
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
	this.refresh();
    // ----------------------
}
WfPanel.prototype.init = function (){

    WfPanel.prototype.triangleUp = HoverIcons.prototype.triangleUp;
    WfPanel.prototype.triangleRight = HoverIcons.prototype.triangleRight;
    WfPanel.prototype.triangleDown = HoverIcons.prototype.triangleDown;
    WfPanel.prototype.triangleLeft = HoverIcons.prototype.triangleLeft;
    WfPanel.prototype.refreshTarget = HoverIcons.prototype.refreshTarget;
    WfPanel.prototype.roundDrop = HoverIcons.prototype.roundDrop;

	WfPanel.prototype.rowGroups = [];
	WfPanel.prototype.colGroups = [];

    this.drawActions();//绘制操作区域
    this.addGeneralPalette(true);
    
}

/**
 * Sets the default font size.
 */
WfPanel.prototype.collapsedImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/collapsed.gif' : 'data:image/gif;base64,R0lGODlhDQANAIABAJmZmf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNUQyRTJFNjZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNUQyRTJFNzZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERjc3MEUxNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFERjc3MEUyNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhSMj6lrwAjcC1GyahV+dcZJgeIIFgA7';

/**
 * Sets the default font size.
 */
WfPanel.prototype.expandedImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/expanded.gif' : 'data:image/gif;base64,R0lGODlhDQANAIABAJmZmf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREY3NzBERjZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREY3NzBFMDZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERjc3MERENkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFERjc3MERFNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhGMj6nL3QAjVHIu6azbvPtWAAA7';

/**
 * Sets the default font size.
 */
WfPanel.prototype.tooltipImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/tooltip.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAbCAMAAAB7jU7LAAAACVBMVEX///+ZmZn///9Y2COLAAAAA3RSTlP//wDXyg1BAAAAOElEQVR42mXQMQ4AMAgDsWv//+iutcJmIQSk+9dJpVKpVCqVSqVSqZTdncWzF8/NeP7FkxWenPEDOnUBiL3jWx0AAAAASUVORK5CYII=';

/**
 * 
 */
WfPanel.prototype.searchImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/search.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEaSURBVHjabNGxS5VxFIfxz71XaWuQUJCG/gCHhgTD9VpEETg4aMOlQRp0EoezObgcd220KQiXmpretTAHQRBdojlQEJyukPdt+b1ywfvAGc7wnHP4nlZd1yKijQW8xzNc4Su+ZOYfQ3T6/f4YNvEJYzjELXp4VVXVz263+7cR2niBxAFeZ2YPi3iHR/gYERPDwhpOsd6sz8x/mfkNG3iOlWFhFj8y89J9KvzGXER0GuEaD42mgwHqUtoljbcRsTBCeINpfM/MgZLKPpaxFxGbOCqDXmILN7hoJrTKH+axhxmcYRxP0MIDnOBDZv5q1XUNIuJxifJp+UNV7t7BFM6xeic0RMQ4Bpl5W/ol7GISx/eEUUTECrbx+f8A8xhiZht9zsgAAAAASUVORK5CYII=';

/**
 * 
 */
WfPanel.prototype.dragPreviewBorder = '1px dashed black';

/**
 * Specifies if tooltips should be visible. Default is true.
 */
WfPanel.prototype.enableTooltips = true;

/**
 * Specifies the delay for the tooltip. Default is 16 px.
 */
WfPanel.prototype.tooltipBorder = 16;

/**
 * Specifies the delay for the tooltip. Default is 300 ms.
 */
WfPanel.prototype.tooltipDelay = 300;

/**
 * Specifies the delay for the drop target icons. Default is 200 ms.
 */
WfPanel.prototype.dropTargetDelay = 200;

/**
 * Specifies the URL of the gear image.
 */
WfPanel.prototype.gearImage = STENCIL_PATH + '/clipart/Gear_128x128.png';

/**
 * Specifies the width of the thumbnails.
 */
WfPanel.prototype.thumbWidth = 36;

/**
 * Specifies the height of the thumbnails.
 */
WfPanel.prototype.thumbHeight = 36;

/**
 * Specifies the padding for the thumbnails. Default is 3.
 */
WfPanel.prototype.thumbPadding = (document.documentMode >= 5) ? 0 : 1;

/**
 * Specifies the delay for the tooltip. Default is 2 px.
 */
WfPanel.prototype.thumbBorder = 2;

/**
 * Specifies the size of the sidebar titles.
 */
WfPanel.prototype.sidebarTitleSize = 9;

/**
 * Specifies if titles in the sidebar should be enabled.
 */
WfPanel.prototype.sidebarTitles = false;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
WfPanel.prototype.tooltipTitles = true;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
WfPanel.prototype.maxTooltipWidth = 400;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
WfPanel.prototype.maxTooltipHeight = 400;

/**
 * Specifies if stencil files should be loaded and added to the search index
 * when stencil palettes are added. If this is false then the stencil files
 * are lazy-loaded when the palette is shown.
 */
WfPanel.prototype.addStencilsToIndex = true;

/**
 * Specifies the width for clipart images. Default is 80.
 */
WfPanel.prototype.defaultImageWidth = 80;

/**
 * Specifies the height for clipart images. Default is 80.
 */
WfPanel.prototype.defaultImageHeight = 80;
/**
 */
WfPanel.prototype.refresh = function (){
	let undoManager = this.editorUi.editor.undoManager;
	let history = undoManager.history;
	let indexOfNextAdd  = undoManager.indexOfNextAdd;

	let undo = document.getElementsByClassName('icon-workflow-chexiao')[0];
	let redo = document.getElementsByClassName('icon-workflow-fanhui')[0];
	if(undo && redo){
		if(history.length>0){
			if(indexOfNextAdd == 0){
				undo.style.color = '#ddd';
				undo.style.cursor = 'not-allowed';
			}else{
				undo.style.color = '#000';
				undo.style.cursor = 'pointer';
			}

			if(indexOfNextAdd == history.length){
				redo.style.color = '#ddd';
				redo.style.cursor = 'not-allowed';
			}else{
				redo.style.color = '#000';
				redo.style.cursor = 'pointer';
			}
		}else{
			undo.style.color = '#ddd';
			undo.style.cursor = 'not-allowed';
		}
	}
	
}
/**
绘制每个操作项及方法
 */
WfPanel.prototype.drawActions = function(){
    let iconActions = this.editorUi.actions;
	var graph = this.editorUi.editor.graph;
    var _this = this;
    let icons = [ //所有的操作按钮
        {icon:'icon-workflow-baocun',action:iconActions.get('save'),title:'保存'},
        {icon:'icon-workflow-daochu',action:iconActions.get('export'),title:'导出'},
        {icon:'icon-workflow-chexiao',action:iconActions.get('undo'),title:'撤销'},
        {icon:'icon-workflow-fanhui',action:iconActions.get('redo'),title:'返回'},
        {icon:'icon-workflow-shanchu',action:iconActions.get('delete'),title:'删除'},

        {icon:'icon-workflow-tianjiafenzu',action:'',title:'添加分组'},
        {icon:'icon-workflow-ziti',action:'',title:'字体'},
        {icon:'icon-workflow-hengxiangfenzu',action:'1',title:'横向分组'},
        {icon:'icon-workflow-zongxiangfenzu',action:'1',title:'纵向分组'},

        {icon:'icon-workflow-kaozuoduiqi',action:'1',title:'左对齐'},
        {icon:'icon-workflow-shangxiadengjian',action:'1',title:'垂直居中'},
        {icon:'icon-workflow-kaoyouduiqi',action:'1',title:'右对齐'},
        {icon:'icon-workflow-kaoshangduiqi',action:'1',title:'上对齐'},
        {icon:'icon-workflow-zuoyoudengjian',action:'1',title:'水平居中'},
        {icon:'icon-workflow-kaoxiaduiqi',action:'1',title:'下对齐'},

        {icon:'icon-workflow-biaochi',action:'1',title:'标尺'},
        {icon:'icon-workflow-wangge',action:'1',title:'网格'},
        {icon:'icon-workflow-xianshifenzu',action:{funct:_this.setTipInfoShow.bind(_this)},title:'显示分组'},
        {icon:'icon-workflow-huifuyuanbil',action:iconActions.get('resetView'),title:'恢复原比例'},
        {icon:'icon-workflow-suoxiao',action:iconActions.get('zoomOut'),title:'缩小'},
        {icon:'icon-workflow-fangda',action:iconActions.get('zoomIn'),title:'放大'},

        {icon:'icon-workflow-ceshi',action:'1',title:'测试'},
        {icon:'icon-workflow-tingzhi',action:'1',title:'停止'},
    ]
    let elDiv;
    icons.map((v,i)=>{
        if(i==0||i==5||i==9||i==15||i==21){
            elDiv = document.createElement('div');
            elDiv.className = 'action-area';
            let elDiv_tip = document.createElement('div');
            elDiv_tip.className = 'action-area-tip';
            elDiv_tip.innerHTML = i==0?'编辑':i==5?'标注':i==9?'对齐':i==15?'视图（100%）':i==21?'测试':'';
            elDiv_tip.style.display = this.tipInfoDisplay;
            elDiv.appendChild(elDiv_tip);
        }
		let spanEl = this.createIconElement(v,this,this.editorUi.editor);
        elDiv.appendChild(spanEl);
		// scale range
        if(i==19){
            let input = this.createIconRangeInput(graph);
            elDiv.appendChild(input);
        }
		// 
		// 分界线
        if(i==4 || i==8 || i==14 || i==20 || i==22 || i==icons.length-1){
            this.container.appendChild(elDiv);
            if(i!=icons.length-1){
                let spanSplit = document.createElement('span');
                spanSplit.className = 'wfEditor-split';
                this.container.appendChild(spanSplit);
            }
        }
    });
}
/**
创建rangeINput
 */
WfPanel.prototype.createIconRangeInput = function(graph){
	let input = document.createElement('INPUT');
	input.type = 'range';
	input.className = 'wf-view-range';
	input.onchange = function(val){
		let value = val.target.value;
		input.value = value;
		input.style.backgroundSize = `${value}% 100%`;
		let viewVal = value/50;

		if(viewVal <= 0.2){
			graph.zoomTo(0.2);
		}else{
			graph.zoomTo(viewVal);
		}
		//  0.2 - 2   0 - 100
		var tips = document.getElementsByClassName('action-area-tip')[4];
		tips.innerHTML = `视图（${Math.round(viewVal*100)}%）`;
	}
	return input;
}	
/**
创建每个顶部操作项dom元素
 */
WfPanel.prototype.createIconElement = function(item,sb,editor){
	let spanEl;
	let history = editor.undoManager.history;
	if(item.icon === 'icon-workflow-tianjiafenzu'){//添加分组
		spanEl = sb.drawAreaGroup();
	}else{
		spanEl = document.createElement('span');
	}
	spanEl.className = `${item.icon} icon-workflow`;
	spanEl.title = item.title || 'title';
	spanEl.onclick = function(e){
		item.action&&sb.setIconsActions(item.action,e,item.icon);
	}
	return spanEl;
}
/**
icons actions
 */
WfPanel.prototype.setIconsActions = function(func,evt,icon){
    var graph = this.editorUi.editor.graph;
    if(icon=='icon-workflow-wangge'){//设置网格显示隐藏
        let gridEnables = graph.isGridEnabled();
        let color = graph.view.gridColor;
        graph.setGridEnabled(!gridEnables);
        if(!gridEnables){
            this.editorUi.setGridColor(color);
        }
        this.editorUi.fireEvent(new mxEventObject('gridEnabledChanged'));
    }else if(icon=='icon-workflow-biaochi'){
		let gridEnables = graph.isRuleEnabled();
		graph.setRuleEnabled(!gridEnables);
		this.editorUi.fireEvent(new mxEventObject('ruleEnabledChanged'));
	}else if(icon=='icon-workflow-kaozuoduiqi' || icon=='icon-workflow-shangxiadengjian' || icon=='icon-workflow-kaoyouduiqi' || icon=='icon-workflow-kaoshangduiqi'
		|| icon=='icon-workflow-zuoyoudengjian' || icon=='icon-workflow-kaoxiaduiqi'){

		icon=='icon-workflow-kaozuoduiqi' && graph.alignCells(mxConstants.ALIGN_LEFT);
		icon=='icon-workflow-shangxiadengjian' && graph.alignCells(mxConstants.ALIGN_CENTER);
		icon=='icon-workflow-kaoyouduiqi' && graph.alignCells(mxConstants.ALIGN_RIGHT);
		icon=='icon-workflow-kaoshangduiqi' && graph.alignCells(mxConstants.ALIGN_TOP);
		icon=='icon-workflow-zuoyoudengjian' && graph.alignCells(mxConstants.ALIGN_MIDDLE);
		icon=='icon-workflow-kaoxiaduiqi' && graph.alignCells(mxConstants.ALIGN_BOTTOM);
	}else if(icon=='icon-workflow-hengxiangfenzu'){
		this.drawColGroup();
	}else if(icon=='icon-workflow-zongxiangfenzu'){
		this.drawRowGroup();
	}else if(icon=='icon-workflow-ceshi'){
		this.doWorkflowTest();
	}else if(icon=='icon-workflow-tingzhi'){
		this.stopWorkflowTest();
	}else{
        func.funct(evt);
        if(icon=='icon-workflow-suoxiao' || icon=='icon-workflow-fangda' || icon=='icon-workflow-huifuyuanbil'){//修改操作区域显示缩放值
            var tips = document.getElementsByClassName('action-area-tip')[4];
            tips.innerHTML = `视图（${Math.round(graph.view.scale*100)}%）`;

			var inputRange = document.getElementsByClassName('wf-view-range')[0];
            inputRange.value = graph.view.scale * 50;
			inputRange.style.backgroundSize = `${graph.view.scale * 50}% 100%`;
        }
    }
}
WfPanel.prototype.drawRowGroup = function(){
	let wfGroup = workflowUi.wfGroups;
	let rowObj = {
		type:'row',
		position:{left:0},
		panelHeight:150,
		value:'分组（横向）'
	}
	wfGroup.addRowGroup(rowObj);
	// var _container;
	// if(document.getElementById('wf-groups-container')){
	// 	_container = document.getElementById('wf-groups-container');
	// }else{
	// 	_container = document.createElement('div');
	// 	_container.id = 'wf-groups-container';
	// 	document.body.appendChild(_container);
	// } 
	// var rowGroup = document.createElement('p');
	// rowGroup.className = 'workflow-row-group';

	// this.groupDragAction(rowGroup,'row');
	// _container.appendChild(rowGroup);
}
WfPanel.prototype.drawColGroup = function(){
	let wfGroup = workflowUi.wfGroups;
	
	let rowObj = {
		type:'col',
		position:{top:0},
		panelWidth:150,
		value:'分组（纵向）'
	}
	// this.tipInfoDisplay = 'block' ? rowObj.position.top = 135 : rowObj.position.top = 100;
	wfGroup.addColGroup(rowObj);
	// var _container;
	// if(document.getElementById('wf-groups-container')){
	// 	_container = document.getElementById('wf-groups-container');
	// }else{
	// 	_container = document.createElement('div');
	// 	_container.id = 'wf-groups-container';
	// 	document.body.appendChild(_container);
	// } 

	// var colGroup = document.createElement('p');
	// this.tipInfoDisplay = 'block' ? colGroup.style.top = '135px' : colGroup.style.top = '100x';
	// colGroup.className = 'workflow-col-group';

	// this.groupDragAction(colGroup,'col');
	// _container.appendChild(colGroup);
}
WfPanel.prototype.groupDragAction = function(element,direction = 'col'){
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
		console.log(mouseDownX,mouseDownY,initX,initY,flag);
	}
	
}
/**
绘制横向分组
WfPanel.prototype.drawRowGroup = function(){
	var cells,
		title='分组',
		showLabel='分组',
		showTitle='分组',
		width=300,height=10,
		allowCellsInserted,icon,
		style=`line;strokeWidth=2;html=1;connectable=0;resizable=0;dashed=1;`;
		
	cells = [new mxCell( '', new mxGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	cells[0].isRowGroup = true;

	var element = this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted,icon,true);
	return element;
}
 */
/**
绘制纵向分组
 
WfPanel.prototype.drawColGroup = function(){
	var cells,
		title='分组',
		showLabel='分组',
		showTitle='分组',
		width=10,height=300,
		allowCellsInserted,icon,
		style=`line;direction=south;strokeWidth=2;html=1;connectable=0;resizable=0;dashed=1;`;
		
	cells = [new mxCell( '', new mxGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	cells[0].isColGroup = true;
	// var fn = this.createVertexTemplateEntry(style, width, height, '分组', '分组');
	// var fn_1 = fn();

	// var element = this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted,icon,true);
	// return element;

	var _container = document.getElementsByClassName('geBackgroundPage')[0];
	var colGroup = document.createElement('p');
	console.log(_container,';_container')
	colGroup.className = 'workflow-col-group';
	_container.appendChild(colGroup);
}*/
/**
区域分组按钮
 */
WfPanel.prototype.drawAreaGroup = function(){
	var cells,
		title='分组',
		showLabel='分组',
		showTitle='分组',
		width=300,height=200,
		allowCellsInserted,icon,
		style=`rounded=1;arcSize=10;fillColor=none;dashed=1;strokeColor=#666666;strokeWidth=2;labelPosition=center;verticalLabelPosition=top;
		align=center;verticalAlign=bottom;connectable=0;fontSize=18;fontStyle=1;fontFamily='宋体';`;
		
	cells = [new mxCell( '分组', new mxGeometry(10, 10, width, height), style)];
	cells[0].vertex = true;
	cells[0].isGroupArea = true;
	// var fn = this.createVertexTemplateEntry(style, width, height, '分组', '分组');
	// var fn_1 = fn();

	var element = this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted,icon,true);
	return element;
}
/**
绘制分组
 */
WfPanel.prototype.drawGroup = function(){
	console.log(this.rowGroups,'this.rowGroups',this.colGroups,window.innerWidth);
	var maxWidth = window.innerWidth - 240;
	var maxHeight = window.innerHeight - 135;

	var graph = this.editorUi.editor.graph;
	var svgCanvas = graph.getSvg();
	
	console.log(svgCanvas,'svgCanvas',graph.svgCanvas);
	var view = graph.view;
	var __root = view.getDrawPane().ownerSVGElement;

	var svgG;
	if(document.getElementById('groups-line') == null){
		svgG = graph.svgCanvas.createElement('g');
		svgG.setAttribute('id','groups-line');
	}else{
		svgG = document.getElementById('groups-line');
		svgG.innerHTML = '';
	}
	this.rowGroups.map(v=>{
		var svgEl_1 = graph.svgCanvas.createElement('g');
		var svgEl = graph.svgCanvas.createElement('path');
		var _svgEl = graph.svgCanvas.createElement('path');
		svgEl.setAttribute('id',v.id);
		svgEl.setAttribute('d',`M0 100 L${maxWidth} 100`);
		_svgEl.setAttribute('d',`M0 100 L${maxWidth} 100`);
		_svgEl.setAttribute('visibility',"hidden");
		_svgEl.style="stroke:#fff;stroke-width:10;stroke-dasharray:5;stroke-miterlimit:10;";
		svgEl.style=v.style;

		svgEl_1.addEventListener("mouseenter", this.enterChangeGroupLineState.bind(this,'row'), false);
		svgEl_1.addEventListener("mouseout", this.outChangeGroupLineState.bind(this,'row'), false);

		svgEl_1.appendChild(svgEl);
		svgEl_1.appendChild(_svgEl);
		svgG.appendChild(svgEl_1);
	});
	this.colGroups.map(v=>{
		var svgEl = graph.svgCanvas.createElement('line');
		svgEl.setAttribute('id',v.id);
		svgEl.setAttribute('x1',v.x1);
		svgEl.setAttribute('y1',v.y1);
		svgEl.setAttribute('x2',v.x2);
		svgEl.setAttribute('y2',v.y2);
		svgEl.style=v.style;

		svgEl.addEventListener("mouseenter", this.enterChangeGroupLineState.bind(this,'col'), false);
		svgEl.addEventListener("mouseout", this.outChangeGroupLineState.bind(this,'col'), false);

		svgG.appendChild(svgEl);
	})

	
	__root.appendChild(svgG);
}
/**
enter
改变分组线条样式
 */
WfPanel.prototype.enterChangeGroupLineState = function(type,e){
	console.log('ininenterini enter',e,type);
	e.target.childNodes[0].style="stroke:#000;stroke-width:2;stroke-dasharray:5;cursor:move;stroke-miterlimit:10;";
	// e.target.style="stroke:#000;stroke-width:2;stroke-dasharray:5;cursor:move;stroke-miterlimit:10;";
}	
/**
out
改变分组线条样式
 */
WfPanel.prototype.outChangeGroupLineState = function(type,e){
	console.log('ininenterini out',e,type);
	// e.target.childNodes[0].style="stroke:#999;stroke-width:2;stroke-dasharray:5;cursor:default;stroke-miterlimit:10;";
	e.target.style="stroke:#999;stroke-width:2;stroke-dasharray:5;cursor:default;stroke-miterlimit:10;";
}	
/**
控制每块操作区域提示语
 */
WfPanel.prototype.setTipInfoBtn = function(){
    let tipBtn = document.createElement('button');
    tipBtn.innerHTML = 'show tip'
    tipBtn.onclick = this.setTipInfoShow.bind(this);
    this.container.appendChild(tipBtn);
}
WfPanel.prototype.setTipInfoShow = function(){
	let elDiv_tips = document.getElementsByClassName('action-area-tip');
	for(let i  = 0 ; i <elDiv_tips.length ; ++i){
		if(this.tipInfoDisplay=='none'){
			elDiv_tips[i].style.display = 'block';
		}else{
			elDiv_tips[i].style.display = 'none';
		}
	}
	this.tipInfoDisplay = this.tipInfoDisplay=='none'?this.tipInfoDisplay='block':this.tipInfoDisplay='none';
	this.reDrawGraphSize(this.tipInfoDisplay=='block'?true:false);
}
/**
重绘 绘制区域大小
 */
WfPanel.prototype.reDrawGraphSize = function(show=true){
	var wfEditor = this.editorUi.wfEditor;
	var diagramContainer = this.editorUi.diagramContainer;
	var graph = this.editorUi.editor.graph;
	var model = graph.model;

	this.nodePanelHide = !this.nodePanelHide;
	try
	{
		if(show){//隐藏 向右移动隐藏
			wfEditor.container.style.height = '150px';
			diagramContainer.style.top = '135px';
			graph.pageFormat.height = graph.pageFormat.height - 35;
		}else{//显示 向左移动显示
			wfEditor.container.style.height = '100px';
			diagramContainer.style.top = '100px';
			graph.pageFormat.height = graph.pageFormat.height + 35;
		}
		graph.refresh();
	}
	finally
	{
		// model.endUpdate();
	}
	
}
/**gg */
WfPanel.prototype.__test = function(show=true){
	/*ReactDOM.render(
		React.createElement(antd.Table,
		{
			// loading:true,
			columns:[{
				dataIndex:"a",
				title:"a",
				render(text,record) {
					return React.createElement("div",{
						dangerouslySetInnerHTML:{__html:"<a href='[图片][图片]https://www.baidu.com' target='_blank'>"+text+"</a>"}
					})
				}
			}],
			dataSource:[{a:1}]
		}),
		document.getElementById("container"));
	*/
}
/**
流程测试
 */
WfPanel.prototype.doWorkflowTest = function(){
	var graph = this.editorUi.editor.graph;
	var view = graph.view;
	var startX = graph.minimumGraphSize.x;
	var startY = graph.minimumGraphSize.y;
	var graphWidth = graph.minimumGraphSize.width;
	var graphHeight = graph.minimumGraphSize.height;

	var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);
	var allEdges = [];
	var testWaysObj = {} //存放测试路径数据，有可能有多条路线
	this.wfTestIsIng = true;

	var theStartCell = null , haveAEndCell = false; //haveAEndCell : 是否有归档节点
	for(let i = 0 , len = allCells.length; i < len ; ++i){
		if(allCells[i].nodeType == 0){
			theStartCell = allCells[i] ;
		}
		if(allCells[i].nodeType == 3){
			haveAEndCell = true ;
		}
		if(allCells[i].edge){
			allEdges.push(allCells[i]);
		}
	}
	if(!theStartCell){
		wfModal.warning({
			title: wfGetLabel(131329, "信息确认"),
			content:'必须有一个创建节点！',
			okText: wfGetLabel(83446, "确定"),
			onOk:()=>{console.log('ok')},
		});
	}else{
		if(haveAEndCell){
			this.workflowTestV2(theStartCell);
		}else{
			wfModal.warning({
				title: wfGetLabel(131329, "信息确认"),
				content:'至少有一个归档节点！',
				okText: wfGetLabel(83446, "确定"),
				onOk:()=>{console.log('ok')},
			});
		}
	}
}
/**
*流程测试是否在测试中
 */
WfPanel.prototype.wfTestIsIng = false;
/**
*流程测试中初始化的timeout
 */
WfPanel.prototype.wfTestTimeOutList = [];
/**开始测试 */
WfPanel.prototype.startWorkflowTest = function(pointArr=[],nowEdge){
	var graph = this.editorUi.editor.graph;
	var sb = this;

	if(pointArr.length > 0 && pointArr[0]){
		var _container = document.getElementsByClassName('geBackgroundPage')[0];
		var eltSpan = document.createElement('span');
		eltSpan.className = 'workfow-test';
		eltSpan.style.left = pointArr[0].x - 5 + 'px';
		eltSpan.style.top = pointArr[0].y - 5 + 'px';
		_container.appendChild(eltSpan);

		let transX=0 , transY=0 , timeout;
		for(let i = 0 , len = pointArr.length ; i < len ; ++i){
			if(pointArr[i-1]){
				let _transX=transX , _transY=transY , index = i;
				if(pointArr[i].x == pointArr[i-1].x){ //纵向移动
					_transY += pointArr[i].y - pointArr[i-1].y;
					transY = _transY;
				}
				if(pointArr[i].y == pointArr[i-1].y){//横向移动
					_transX += pointArr[i].x - pointArr[i-1].x;
					transX = _transX;
				}
				timeout = setTimeout(()=>{
					eltSpan.style.transform = `translate(${_transX}px,${_transY}px)`;
					if(index == pointArr.length -1){//当前运动路径最后一个点
						clearTimeout(timeout);
						let _time = setTimeout(()=>{
							eltSpan && _container.removeChild(eltSpan);
							clearTimeout(_time);
							sb.workflowTestV2(nowEdge.target);
						},800);
						sb.wfTestTimeOutList.push(_time);
					}
				},i==1?0:(i-1)*800);
				sb.wfTestTimeOutList.push(timeout);
			}
		}
	}
}
/**
流程测试 v2
 */
WfPanel.prototype.workflowTestV2 = function(cellNode){

	if(!this.wfTestIsIng){
		return;
	}
	var graph = this.editorUi.editor.graph;
	var model = graph.model;
	var view = graph.view;
	/**
	如果cellNode没有出口&&不是归档节点
	如果cellNode是归档节点
	测试结束
	*/
	var edges = null;
	let haveExit = false ;
	if(cellNode != null && cellNode.nodeType!=3 && cellNode.edges != null && cellNode.edges.length > 0){
		edges = cellNode.edges;
		edges.map(v=>{
			if(v.source.id == cellNode.id ){
				haveExit = true;
				let edgePoints = [];
				model.beginUpdate();
				try
				{
					var style = mxUtils.setStyle(model.getStyle(v), 'strokeColor', '#FFFF66');
					// model.setStyle(v, style);
					// v.setStyle(style);
					// v.setAttribute('style',style);
				}
				finally
				{
					model.endUpdate();
					edgePoints = view.getState(v).absolutePoints
					!v.isTested && this.startWorkflowTest(edgePoints,v);
					v.isTested = true;
					// v.setAttribute('isTested',true);
				}
			}
		});
		if(!haveExit){
			// wfModal.warning({
			// 	title: wfGetLabel(131329, "信息确认"),
			// 	content:`${cellNode.value}节点：出口设置不正确！`,
			// 	okText: wfGetLabel(83446, "确定"),
			// 	onOk:()=>{console.log('ok')},
			// });
			let wfTestSpanElt = document.getElementsByClassName('workfow-test');
			if(wfTestSpanElt.length == 0){
				this.stopWorkflowTest(1);
			}
			console.log(wfTestSpanElt,'workfow-test')
		}
	}
	cellNode.nodeType == 3 ? haveExit = true : '';
	this.openWorkflowTestPanel(cellNode,haveExit);//打开详细信息面板
}
/**
停止流程测试
 */
WfPanel.prototype.stopWorkflowTest = function(fromTest=0){
	var graph = this.editorUi.editor.graph;
	var view = graph.view;
	var startX = graph.minimumGraphSize.x;
	var startY = graph.minimumGraphSize.y;
	var graphWidth = graph.minimumGraphSize.width;
	var graphHeight = graph.minimumGraphSize.height;

	this.wfTestTimeOutList.map(v=>{
		clearTimeout(v);
	});
	this.wfTestTimeOutList = [];
	this.wfTestIsIng = false;

	var allCells = graph.getAllCells(startX,startY,graphWidth,graphHeight);
	var allEdges = [];

	var theStartCell = null;
	for(let i = 0 , len = allCells.length; i < len ; ++i){
		if(allCells[i].edge){
			allCells[i].isTested = false;
		}
	}
	let wfTestSpanElt = document.getElementsByClassName('workfow-test');
	for(let i = 0 ,len = wfTestSpanElt.length; i< len ; ++i){
		wfTestSpanElt[0].style.display = 'none';
		wfTestSpanElt[0].parentNode.removeChild(wfTestSpanElt[0]);
	}
	this.hideWorkflowTestPanel(fromTest);//隐藏测试详细信息面板
}
/**
	打开workflow test详细信息面板
*/
WfPanel.prototype.openWorkflowTestPanel = function(cellNode,isPassed)
{
	var wfTestPanel,vertSplit;
	if(document.getElementById('workflow-test-detail-panel')){
		wfTestPanel = document.getElementById('workflow-test-detail-panel');
		wfTestPanel.style.bottom = '8px';
	}else{
		let elt = document.createElement('div');
		elt.id = 'workflow-test-detail-panel';
		wfTestPanel = elt;
		document.body.appendChild(wfTestPanel);
	}
	// 调节高度拖动元素
	if(document.getElementById('test-panel-split')){
		vertSplit = document.getElementById('test-panel-split');
		vertSplit.style.bottom = wfTestPanel.clientHeight + 'px';
	}else{
		let elt = document.createElement('div');
		elt.id = 'test-panel-split';
		elt.className = 'geVsplit';
		vertSplit = elt;

		document.body.appendChild(vertSplit);
		
		vertSplit.style.height = '10px';
		
		workflowUi.addSplitHandler(vertSplit, false, 0, mxUtils.bind(workflowUi, function(value)
		{
			value<=8 ? value = 8 : '';
			console.log(value,'value')
			wfTestPanel.style.height = value + 'px';
			wfTestPanel.style.bottom = '8px';
			vertSplit.style.bottom = value + 'px';
		}));
	}

	wfTestPanel.style.width = workflowUi.wfNodeInfo.nodePanelHide ? '100%' :'calc(100% - 250px)';
	this.writeWorkflowTestInfo(wfTestPanel,cellNode,isPassed);
}
/**
	隐藏workflow test详细信息面板
*/
WfPanel.prototype.hideWorkflowTestPanel = function(fromTest)
{
	var wfTestPanel;
	if(document.getElementById('workflow-test-detail-panel')){
		wfTestPanel = document.getElementById('workflow-test-detail-panel');
	}else{
		return;
	}
	if(fromTest != 1){
		let vertSplit = document.getElementById('test-panel-split');
		vertSplit?vertSplit.style.bottom = '8px':'';
		wfTestPanel.style.bottom = - wfTestPanel.clientHeight+ 'px';
	}
}
/**
	写入测试信息新进入面板
*/
WfPanel.prototype.writeWorkflowTestInfo = function(container,cellNode,isPassed)
{
	if(cellNode.nodeType == 0){//创建节点 ：  需多绘制测试分界线
		let elP_split = document.createElement('p');
		let elP_start = document.createElement('p');
		elP_split.className = 'wfTest-detail-item';
		elP_start.className = 'wfTest-detail-item';
		elP_split.innerHTML = '[信息] ****************************************************************************************************************';
		elP_start.innerHTML = '[信息] 工作流 开始检查';
		container.appendChild(elP_split);
		container.appendChild(elP_start);
	}
	let nodeType = '',nodeAttriBute = '';
	nodeType = 
		cellNode.nodeType == 0 ? '创建' :
		cellNode.nodeType == 1 ? '审批' :
		cellNode.nodeType == 2 ? '处理' :
		cellNode.nodeType == 3 ? '归档' : '';
	nodeAttriBute = 
		cellNode.nodeAttriBute == 0 ? '一般' : 
		cellNode.nodeAttriBute == 1 ? '分叉起始点' :  
		cellNode.nodeAttriBute == 2 ? '分叉中间点' :
		cellNode.nodeAttriBute == 3 ? '通过分支数合并' :
		cellNode.nodeAttriBute == 4 ? '指定通过分支合并' :
		cellNode.nodeAttriBute == 5 ? '比例合并' : '';

	let elP_detail = document.createElement('p');
	if(isPassed){
		elP_detail.className = 'wfTest-detail-item';
		elP_detail.innerHTML = `[信息] 节点：[${cellNode.value}] 基本信息：[节点名称：${cellNode.value}，节点类型：${nodeType}，节点属性：${nodeAttriBute}]`;
	}else{
		elP_detail.className = 'wfTest-detail-item wfTest-item-wrong';
		elP_detail.innerHTML = `[错误] 节点：[${cellNode.value}] 没有出口`;
	}
	container.appendChild(elP_detail);
}
/**
 * Hides the current tooltip.
 */
WfPanel.prototype.hideTooltip = function()
{
	if (this.thread != null)
	{
		window.clearTimeout(this.thread);
		this.thread = null;
	}
	
	if (this.tooltip != null)
	{
		this.tooltip.style.display = 'none';
		this.tooltipImage.style.visibility = 'hidden';
		this.currentElt = null;
	}
};
/**
siderbar  funcs //图形参数配置
 */
WfPanel.prototype.addGeneralPalette = function(expand)
{
	var sb = this;
	var lineTags = 'line lines connector connectors connection connections arrow arrows ';
	let wfStrokeStyle = 'fillColor=#BFF3C3;strokeColor=#5ABD6B;resizable=0;';

	var fns = [
		this.createVertexTemplateEntry('shape=mxgraph.flowchart.terminator;whiteSpace=wrap;html=1;icons={"right":"icon-workflow-ceshi"};'+wfStrokeStyle, 
		 110, 70, '创建人', '创建', null, null, 'rounded rect rectangle box','icon-workflow-chuangjian','','0','0'),
	 	// this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;html=1;icons={"right":"icon-workflow-ceshi"};'+wfStrokeStyle, 
		//  110, 70, '创建人', '创建', null, null, 'rounded rect rectangle box','icon-workflow-chuangjian','','0'),
	 	this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;'+wfStrokeStyle, 110, 70, '处理', '处理', null, null,
		'rect rectangle box','icon-workflow-chuli','','2','0'),
        this.createVertexTemplateEntry('rhombus;whiteSpace=wrap;html=1;'+wfStrokeStyle, 130, 80, '审批', '审批', null, null, 
        'diamond rhombus if condition decision conditional question test','icon-workflow-shenpi','','1','0'),
        this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-fencha"};'+wfStrokeStyle, 110, 70,`分叉`, `分叉`,
         null, null, 'rect rectangle box','icon-workflow-fencha','oneToBranch','2','1'),
        this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-fenchazhongjiandian"};'+wfStrokeStyle,
		 110, 70, '分叉中间点', '分叉中间点', null, null, 'rect rectangle box','icon-workflow-fenchazhongjiandian','branchCenter','2','2'),
        this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-hebing"};'+wfStrokeStyle,
		 110, 70, '合并节点', '合并节点', null, null, 'rect rectangle box','icon-workflow-hebing','branchToOne','2','3'),
	 	// this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;html=1;icons={"right":"icon-workflow-guidang"};'+wfStrokeStyle,
		//  110, 70, '归档', '归档', null, null, 'rounded rect rectangle box','icon-workflow-guidang','','3'),
	 	this.createVertexTemplateEntry('shape=mxgraph.flowchart.terminator;whiteSpace=wrap;html=1;icons={"right":"icon-workflow-guidang"};'+wfStrokeStyle,
		 110, 70, '归档', '归档', null, null, 'rounded rect rectangle box','icon-workflow-guidang','','3','0'),
	 	// Explicit strokecolor/fillcolor=none is a workaround to maintain transparent background regardless of current style
            // this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;',
            //     40, 20, 'Text', '', null, null, 'text textbox textarea label','icon-workflow-fencha'),
            // this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;', 190, 120,
            //     '<h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
            //     'Textbox', null, null, 'text textbox textarea','icon-workflow-fenchazhongjiandian'),
            // this.createVertexTemplateEntry('shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;', 120, 60, '', 'Process', null, null, 'process task','icon-workflow-hebing'),
	 	
    ]
    this.addPaletteFunctions('1', '111', (expand != null) ? expand : true, fns);
}
/**
 * Adds the given palette.
 */
WfPanel.prototype.addPaletteFunctions = function(id, title, expanded, fns)
{
	this.addPalette(id, title, expanded, mxUtils.bind(this, function(content)
	{
		for (var i = 0; i < fns.length; i++)
		{
			content.appendChild(fns[i](content));
		}
	}));
};
/**
 * Adds the given palette.
 */
WfPanel.prototype.addPalette = function(id, title, expanded, onInit)
{
	// var elt = this.createTitle(title);
	// this.container.appendChild(elt);
	
	var div = document.createElement('div');
	div.className = 'action-area';
	
    var tipInfo = document.createElement('div');
    tipInfo.className = 'action-area-tip';
    tipInfo.innerHTML = '节点';
    div.appendChild(tipInfo);

	// Disables built-in pan and zoom in IE10 and later
	if (mxClient.IS_POINTER)
	{
		div.style.touchAction = 'none';
	}

	if (expanded)
	{
		onInit(div);
		onInit = null;
	}
	else
	{
		div.style.display = 'none';
	}
    var wfSplit = document.createElement('div');
	wfSplit.className = 'wfEditor-split';
    this.container.insertBefore(div,this.container.childNodes[2]);
    this.container.insertBefore(wfSplit,this.container.childNodes[3]);
    
    // Keeps references to the DOM nodes
    if (id != null)
    {
    		// this.palettes[id] = [elt, outer];
    }
    
    return div;
};
/**
 * Creates and returns the given title element.
 */
WfPanel.prototype.createTitle = function(label)
{
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.setAttribute('title', mxResources.get('sidebarTooltip'));
	elt.className = 'geTitle';
	mxUtils.write(elt, label);

	return elt;
};
/**
 * Create the given title element.
 */
WfPanel.prototype.addFoldingHandler = function(title, content, funct)
{
	var initialized = false;

	// Avoids mixed content warning in IE6-8
	if (!mxClient.IS_IE || document.documentMode >= 8)
	{
		title.style.backgroundImage = (content.style.display == 'none') ?
			'url(\'' + this.collapsedImage + '\')' : 'url(\'' + this.expandedImage + '\')';
	}
	
	title.style.backgroundRepeat = 'no-repeat';
	title.style.backgroundPosition = '0% 50%';

	mxEvent.addListener(title, 'click', mxUtils.bind(this, function(evt)
	{
		if (content.style.display == 'none')
		{
			if (!initialized)
			{
				initialized = true;
				
				if (funct != null)
				{
					// Wait cursor does not show up on Mac
					title.style.cursor = 'wait';
					var prev = title.innerHTML;
					title.innerHTML = mxResources.get('loading') + '...';
					
					window.setTimeout(function()
					{
						var fo = mxClient.NO_FO;
						mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
						funct(content);
						mxClient.NO_FO = fo;
						content.style.display = 'block';
						title.style.cursor = '';
						title.innerHTML = prev;
					}, 0);
				}
				else
				{
					content.style.display = 'block';
				}
			}
			else
			{
				content.style.display = 'block';
			}
			
			title.style.backgroundImage = 'url(\'' + this.expandedImage + '\')';
		}
		else
		{
			title.style.backgroundImage = 'url(\'' + this.collapsedImage + '\')';
			content.style.display = 'none';
		}
		
		mxEvent.consume(evt);
	}));
};

/**
 * Creates a drop handler for inserting the given cells.
 */
//  ('line;strokeWidth=2;html=1;', 160, 10, '', 'Horizontal Line')
WfPanel.prototype.createVertexTemplateEntry = function(style, width, height, value, title, showLabel, showTitle, tags,icon,nodeType='',cellType='',nodeAttriBute='0')
{
	/**
	nodeType:为了区分分叉节点类型
	cellType：为了区分节点类型，创建，处理，审批等
	 */
	tags = (tags != null && tags.length > 0) ? tags : title.toLowerCase();
	
	return this.addEntry(tags, mxUtils.bind(this, function()
 	{
 		return this.createVertexTemplate(style, width, height, value, title, showLabel, showTitle,'',icon,nodeType,cellType,nodeAttriBute);
 	}));
}
/**
 * Creates a drop handler for inserting the given cells.
 */
WfPanel.prototype.createVertexTemplate = function(style, width, height, value, title, showLabel, showTitle, allowCellsInserted,icon,nodeType='',cellType='',nodeAttriBute)
{
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style , nodeType)];
	cells[0].vertex = true;
	cells[0].nodeType = cellType;
	cells[0].nodeAttriBute = nodeAttriBute;

	return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted,icon);
};
/**
 * Creates a drop handler for inserting the given cells.
 */
WfPanel.prototype.createVertexTemplateFromCells = function(cells, width, height, title, showLabel, showTitle, allowCellsInserted,icon)
{
	// Use this line to convert calls to this function with lots of boilerplate code for creating cells
	//console.trace('xml', this.graph.compress(mxUtils.getXml(this.graph.encodeCells(cells))), cells);
	return this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted,icon);
};
/**
 * Hides the current tooltip.
 */
WfPanel.prototype.addEntry = function(tags, fn)
{
	if (this.taglist != null && tags != null && tags.length > 0)
	{
		// Replaces special characters
		var tmp = tags.toLowerCase().replace(/[\/\,\(\)]/g, ' ').split(' ');

		var doAddEntry = mxUtils.bind(this, function(tag)
		{
			if (tag.length > 1)
			{
				var entry = this.taglist[tag];
				
				if (typeof entry !== 'object')
				{
					entry = {entries: [], dict: new mxDictionary()};
					this.taglist[tag] = entry;
				}

				// Ignores duplicates
				if (entry.dict.get(fn) == null)
				{
					entry.dict.put(fn, fn);
					entry.entries.push(fn);
				}
			}
		});
		
		for (var i = 0; i < tmp.length; i++)
		{
			doAddEntry(tmp[i]);
			
			// Adds additional entry with removed trailing numbers
			var normalized = tmp[i].replace(/\.*\d*$/, '');
			
			if (normalized != tmp[i])
			{
				doAddEntry(normalized);
			}
		}
	}
	
	return fn;
};
/**
 * Creates a thumbnail for the given cells.
 */
WfPanel.prototype.createThumb = function(cells, width, height, parent, title, showLabel, showTitle, realWidth, realHeight)
{
	this.graph.labelsVisible = (showLabel == null || showLabel);
	var fo = mxClient.NO_FO;
	mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
	this.graph.view.scaleAndTranslate(1, 0, 0);
	this.graph.addCells(cells);
	var bounds = this.graph.getGraphBounds();
	var s = Math.floor(Math.min((width - 2 * this.thumbBorder) / bounds.width,
			(height - 2 * this.thumbBorder) / bounds.height) * 100) / 100;
	this.graph.view.scaleAndTranslate(s, Math.floor((width - bounds.width * s) / 2 / s - bounds.x),
			Math.floor((height - bounds.height * s) / 2 / s - bounds.y));
	var node = null;
	
	// For supporting HTML labels in IE9 standards mode the container is cloned instead
	if (this.graph.dialect == mxConstants.DIALECT_SVG && !mxClient.NO_FO)
	{
		node = this.graph.view.getCanvas().ownerSVGElement.cloneNode(true);
	}
	// LATER: Check if deep clone can be used for quirks if container in DOM
	else
	{
		node = this.graph.container.cloneNode(false);
		node.innerHTML = this.graph.container.innerHTML;
		
		// Workaround for clipping in older IE versions
		if (mxClient.IS_QUIRKS || document.documentMode == 8)
		{
			node.firstChild.style.overflow = 'visible';
		}
	}
	
	this.graph.getModel().clear();
	mxClient.NO_FO = fo;
	
	// Catch-all event handling
	if (mxClient.IS_IE6)
	{
		parent.style.backgroundImage = 'url(' + this.editorUi.editor.transparentImage + ')';
	}
	
	node.style.position = 'relative';
	node.style.overflow = 'hidden';
	node.style.cursor = 'move';
	node.style.left = this.thumbBorder + 'px';
	node.style.top = this.thumbBorder + 'px';
	node.style.width = width + 'px';
	node.style.height = height + 'px';
	node.style.visibility = '';
	node.style.minWidth = '';
	node.style.minHeight = '';
	
	parent.appendChild(node);
	
	// Adds title for sidebar entries
	if (this.sidebarTitles && title != null && showTitle != false)
	{
		var border = (mxClient.IS_QUIRKS) ? 2 * this.thumbPadding + 2: 0;
		parent.style.height = (this.thumbHeight + border + this.sidebarTitleSize + 8) + 'px';
		
		var div = document.createElement('div');
		div.style.fontSize = this.sidebarTitleSize + 'px';
		div.style.color = '#303030';
		div.style.textAlign = 'center';
		div.style.whiteSpace = 'nowrap';
		
		if (mxClient.IS_IE)
		{
			div.style.height = (this.sidebarTitleSize + 12) + 'px';
		}

		div.style.paddingTop = '4px';
		mxUtils.write(div, title);
		parent.appendChild(div);
	}

	return bounds;
};
/**
 * Creates and returns a new palette item for the given image.
 */
WfPanel.prototype.createItem = function(cells, title, showLabel, showTitle, width, height, allowCellsInserted , icon='' , isGroup = false)
{
	// var elt = document.createElement('a');
	// elt.setAttribute('href', 'javascript:void(0);');
	// elt.className = 'geItem';
	var elt = document.createElement('span');
	elt.className = `${icon} icon-workflow`;

	// elt.style.overflow = 'hidden';
	// var border = (mxClient.IS_QUIRKS) ? 8 + 2 * this.thumbPadding : 2 * this.thumbBorder;
	// elt.style.width = (this.thumbWidth + border) + 'px';
	// elt.style.height = (this.thumbHeight + border) + 'px';
	// elt.style.padding = this.thumbPadding + 'px';
	
	if (mxClient.IS_IE6)
	{
		elt.style.border = 'none';
	}
	
	// Blocks default click action
	mxEvent.addListener(elt, 'click', function(evt)
	{
		mxEvent.consume(evt);
	});

	// this.createThumb(cells, this.thumbWidth, this.thumbHeight, elt, title, showLabel, showTitle, width, height); //预览时也是实际图形的缩放版；
	var bounds = new mxRectangle(0, 0, width, height);
	
	if (cells.length > 1 || cells[0].vertex)
	{
		var ds = this.createDragSource(elt, this.createDropHandler(cells, true, allowCellsInserted,
			bounds), this.createDragPreview(width, height), cells, bounds,isGroup);
		this.addClickHandler(elt, ds, cells);
	
		// Uses guides for vertices only if enabled in graph
		ds.isGuidesEnabled = mxUtils.bind(this, function()
		{
			return this.editorUi.editor.graph.graphHandler.guidesEnabled;
		});
	}
	else if (cells[0] != null && cells[0].edge)
	{
		var ds = this.createDragSource(elt, this.createDropHandler(cells, false, allowCellsInserted,
			bounds), this.createDragPreview(width, height), cells, bounds,isGroup);
		this.addClickHandler(elt, ds, cells);
	}
	
	// Shows a tooltip with the rendered cell
	if (!mxClient.IS_IOS && !isGroup)
	{
		mxEvent.addGestureListeners(elt, null, mxUtils.bind(this, function(evt)
		{
			if (mxEvent.isMouseEvent(evt))
			{
				this.showTooltip(elt, cells, bounds.width, bounds.height, title, showLabel);
			}
		}));
	}
	
	return elt;
};
/**
 * Creates a drag source for the given element.
 */
WfPanel.prototype.createDragSource = function(elt, dropHandler, preview, cells, bounds ,isGroup=false)
{
	// Checks if the cells contain any vertices
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var freeSourceEdge = null;
	var firstVertex = null;
	var sidebar = this;
	
	for (var i = 0; i < cells.length; i++)
	{
		if (firstVertex == null && this.editorUi.editor.graph.model.isVertex(cells[i]))
		{
			firstVertex = i;
		}
		else if (freeSourceEdge == null && this.editorUi.editor.graph.model.isEdge(cells[i]) &&
				this.editorUi.editor.graph.model.getTerminal(cells[i], true) == null)
		{
			freeSourceEdge = i;
		}
		
		if (firstVertex != null && freeSourceEdge != null)
		{
			break;
		}
	}
	
	var dragSource = mxUtils.makeDraggable(elt, this.editorUi.editor.graph, mxUtils.bind(this, function(graph, evt, target, x, y)
	{
		if (this.updateThread != null)
		{
			window.clearTimeout(this.updateThread);
		}
		
		if (cells != null && currentStyleTarget != null && activeArrow == styleTarget)
		{
			var tmp = graph.isCellSelected(currentStyleTarget.cell) ? graph.getSelectionCells() : [currentStyleTarget.cell];
			var updatedCells = this.updateShapes((graph.model.isEdge(currentStyleTarget.cell)) ? cells[0] : cells[firstVertex], tmp);
			graph.setSelectionCells(updatedCells);
		}
		else if (cells != null && activeArrow != null && currentTargetState != null && activeArrow != styleTarget)
		{
			var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
			graph.setSelectionCells(this.dropAndConnect(currentTargetState.cell, cells, direction, index, evt));
		}
		else
		{
			dropHandler.apply(this, arguments);
		}
		
		if (this.editorUi.hoverIcons != null )
		{
			this.editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()))
			
		}
	}), preview, 0, 0, graph.autoscroll, true, true);
	// var dragSource = elt ;
	
	// Stops dragging if cancel is pressed
	graph.addListener(mxEvent.ESCAPE, function(sender, evt)
	{
		if (dragSource.isActive())
		{
			dragSource.reset();
		}
	});

	// Overrides mouseDown to ignore popup triggers
	var mouseDown = dragSource.mouseDown;
	
	dragSource.mouseDown = function(evt)
	{
		if (!mxEvent.isPopupTrigger(evt) && !mxEvent.isMultiTouchEvent(evt))
		{
			graph.stopEditing();
			mouseDown.apply(this, arguments);
		}
	};

	// Workaround for event redirection via image tag in quirks and IE8
	function createArrow(img, tooltip)
	{
		var arrow = null;
		
		if (mxClient.IS_IE && !mxClient.IS_SVG)
		{
			// Workaround for PNG images in IE6
			if (mxClient.IS_IE6 && document.compatMode != 'CSS1Compat')
			{
				arrow = document.createElement(mxClient.VML_PREFIX + ':image');
				arrow.setAttribute('src', img.src);
				arrow.style.borderStyle = 'none';
			}
			else
			{
				arrow = document.createElement('div');
				arrow.style.backgroundImage = 'url(' + img.src + ')';
				arrow.style.backgroundPosition = 'center';
				arrow.style.backgroundRepeat = 'no-repeat';
			}
			
			arrow.style.width = (img.width + 4) + 'px';
			arrow.style.height = (img.height + 4) + 'px';
			arrow.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		}
		else
		{
			arrow = mxUtils.createImage(img.src);
			arrow.style.width = img.width + 'px';
			arrow.style.height = img.height + 'px';
		}
		
		if (tooltip != null)
		{
			arrow.setAttribute('title', tooltip);
		}
		
		mxUtils.setOpacity(arrow, (img == this.refreshTarget) ? 30 : 20);
		arrow.style.position = 'absolute';
		arrow.style.cursor = 'crosshair';
		
		return arrow;
	};

	var currentTargetState = null;
	var currentStateHandle = null;
	var currentStyleTarget = null;
	var activeTarget = false;
	
	var arrowUp = createArrow(this.triangleUp, mxResources.get('connect'));
	var arrowRight = createArrow(this.triangleRight, mxResources.get('connect'));
	var arrowDown = createArrow(this.triangleDown, mxResources.get('connect'));
	var arrowLeft = createArrow(this.triangleLeft, mxResources.get('connect'));
	var styleTarget = createArrow(this.refreshTarget, mxResources.get('replace'));
	// Workaround for actual parentNode not being updated in old IE
	var styleTargetParent = null;
	var roundSource = createArrow(this.roundDrop);
	var roundTarget = createArrow(this.roundDrop);
	var direction = mxConstants.DIRECTION_NORTH;
	var activeArrow = null;
	
	function checkArrow(x, y, bounds, arrow)
	{
		if (arrow.parentNode != null)
		{
			if (mxUtils.contains(bounds, x, y))
			{
				mxUtils.setOpacity(arrow, 100);
				activeArrow = arrow;
			}
			else
			{
				mxUtils.setOpacity(arrow, (arrow == styleTarget) ? 30 : 20);
			}
		}
		
		return bounds;
	};
	
	// Hides guides and preview if target is active
	var dsCreatePreviewElement = dragSource.createPreviewElement;
	
	// Stores initial size of preview element
	dragSource.createPreviewElement = function(graph)
	{
		var elt = dsCreatePreviewElement.apply(this, arguments);
		
		// Pass-through events required to tooltip on replace shape
		if (mxClient.IS_SVG)
		{
			elt.style.pointerEvents = 'none';
		}
		
		this.previewElementWidth = elt.style.width;
		this.previewElementHeight = elt.style.height;
		
		return elt;
	};
	
	// Shows/hides hover icons
	var dragEnter = dragSource.dragEnter;
	dragSource.dragEnter = function(graph, evt)
	{
		if (ui.hoverIcons != null)
		{
			ui.hoverIcons.setDisplay('none');
		}
		
		dragEnter.apply(this, arguments);
	};
	
	var dragExit = dragSource.dragExit;
	dragSource.dragExit = function(graph, evt)
	{
		if (ui.hoverIcons != null)
		{
			ui.hoverIcons.setDisplay('');
		}
		
		dragExit.apply(this, arguments);
	};
	
	dragSource.dragOver = function(graph, evt)
	{
		mxDragSource.prototype.dragOver.apply(this, arguments);

		if (this.currentGuide != null && activeArrow != null)
		{
			this.currentGuide.hide();
		}

		if (this.previewElement != null)
		{
			var view = graph.view;
			
			if (currentStyleTarget != null && activeArrow == styleTarget)
			{
				this.previewElement.style.display = (graph.model.isEdge(currentStyleTarget.cell)) ? 'none' : '';
				
				this.previewElement.style.left = currentStyleTarget.x + 'px';
				this.previewElement.style.top = currentStyleTarget.y + 'px';
				this.previewElement.style.width = currentStyleTarget.width + 'px';
				this.previewElement.style.height = currentStyleTarget.height + 'px';
			}
			else if (currentTargetState != null && activeArrow != null)
			{
				var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
				var geo = sidebar.getDropAndConnectGeometry(currentTargetState.cell, cells[index], direction, cells);
				var geo2 = (!graph.model.isEdge(currentTargetState.cell)) ? graph.getCellGeometry(currentTargetState.cell) : null;
				var geo3 = graph.getCellGeometry(cells[index]);
				var parent = graph.model.getParent(currentTargetState.cell);
				var dx = view.translate.x * view.scale;
				var dy = view.translate.y * view.scale;
				
				if (geo2 != null && !geo2.relative && graph.model.isVertex(parent) && parent != view.currentRoot)
				{
					var pState = view.getState(parent);
					
					dx = pState.x;
					dy = pState.y;
				}
				
				var dx2 = geo3.x;
				var dy2 = geo3.y;

				// Ignores geometry of edges
				if (graph.model.isEdge(cells[index]))
				{
					dx2 = 0;
					dy2 = 0;
				}
				
				// Shows preview at drop location
				this.previewElement.style.left = ((geo.x - dx2) * view.scale + dx) + 'px';
				this.previewElement.style.top = ((geo.y - dy2) * view.scale + dy) + 'px';
				
				if (cells.length == 1)
				{
					this.previewElement.style.width = (geo.width * view.scale) + 'px';
					this.previewElement.style.height = (geo.height * view.scale) + 'px';
				}
				
				this.previewElement.style.display = '';
			}
			else if (dragSource.currentHighlight.state != null &&
				graph.model.isEdge(dragSource.currentHighlight.state.cell))
			{
				// Centers drop cells when splitting edges
				this.previewElement.style.left = Math.round(parseInt(this.previewElement.style.left) -
					bounds.width * view.scale / 2) + 'px';
				this.previewElement.style.top = Math.round(parseInt(this.previewElement.style.top) -
					bounds.height * view.scale / 2) + 'px';
			}
			else
			{
				this.previewElement.style.width = this.previewElementWidth;
				this.previewElement.style.height = this.previewElementHeight;
				this.previewElement.style.display = '';
			}
		}
	};
	
	var startTime = new Date().getTime();
	var timeOnTarget = 0;
	var prev = null;
	
	// Gets source cell style to compare shape below
	var sourceCellStyle = this.editorUi.editor.graph.getCellStyle(cells[0]);
	
	// Allows drop into cell only if target is a valid root
	dragSource.getDropTarget = mxUtils.bind(this, function(graph, x, y, evt)
	{
		// Alt means no targets at all
		// LATER: Show preview where result will go
		var cell = (!mxEvent.isAltDown(evt) && cells != null) ? graph.getCellAt(x, y) : null;
		
		// Uses connectable parent vertex if one exists
		if (cell != null && !this.graph.isCellConnectable(cell))
		{
			var parent = this.graph.getModel().getParent(cell);
			
			if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent))
			{
				cell = parent;
			}
		}
		
		// Ignores locked cells
		if (graph.isCellLocked(cell))
		{
			cell = null;
		}
		
		var state = graph.view.getState(cell);
		activeArrow = null;
		var bbox = null;

		// Time on target
		if (prev != state)
		{
			prev = state;
			startTime = new Date().getTime();
			timeOnTarget = 0;

			if (this.updateThread != null)
			{
				window.clearTimeout(this.updateThread);
			}
			
			if (state != null)
			{
				this.updateThread = window.setTimeout(function()
				{
					if (activeArrow == null)
					{
						prev = state;
						dragSource.getDropTarget(graph, x, y, evt);
					}
				}, this.dropTargetDelay + 10);
			}
		}
		else
		{
			timeOnTarget = new Date().getTime() - startTime;
		}

		// Shift means disabled, delayed on cells with children, shows after this.dropTargetDelay, hides after 2500ms
		if (timeOnTarget < 2500 && state != null && !mxEvent.isShiftDown(evt) &&
			// If shape is equal or target has no stroke, fill and gradient then use longer delay except for images
			(((mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE) != mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) &&
			(mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE) != mxConstants.NONE ||
			mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE) != mxConstants.NONE ||
			mxUtils.getValue(state.style, mxConstants.STYLE_GRADIENTCOLOR, mxConstants.NONE) != mxConstants.NONE)) ||
			mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) == 'image') ||
			timeOnTarget > 1500 || graph.model.isEdge(state.cell)) && (timeOnTarget > this.dropTargetDelay) && 
			((graph.model.isVertex(state.cell) && firstVertex != null) ||
			(graph.model.isEdge(state.cell) && graph.model.isEdge(cells[0]))))
		{
			currentStyleTarget = state;
			var tmp = (graph.model.isEdge(state.cell)) ? graph.view.getPoint(state) :
				new mxPoint(state.getCenterX(), state.getCenterY());
			tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);
			
			styleTarget.style.left = Math.floor(tmp.x) + 'px';
			styleTarget.style.top = Math.floor(tmp.y) + 'px';
			
			if (styleTargetParent == null)
			{
				graph.container.appendChild(styleTarget);
				styleTargetParent = styleTarget.parentNode;
			}
			
			checkArrow(x, y, tmp, styleTarget);
		}
		// Does not reset on ignored edges
		else if (currentStyleTarget == null || !mxUtils.contains(currentStyleTarget, x, y) ||
			(timeOnTarget > 1500 && !mxEvent.isShiftDown(evt)))
		{
			currentStyleTarget = null;
			
			if (styleTargetParent != null)
			{
				styleTarget.parentNode.removeChild(styleTarget);
				styleTargetParent = null;
			}
		}
		else if (currentStyleTarget != null && styleTargetParent != null)
		{
			// Sets active Arrow as side effect
			var tmp = (graph.model.isEdge(currentStyleTarget.cell)) ? graph.view.getPoint(currentStyleTarget) : new mxPoint(currentStyleTarget.getCenterX(), currentStyleTarget.getCenterY());
			tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);
			checkArrow(x, y, tmp, styleTarget);
		}
		
		// Checks if inside bounds
		if (activeTarget && currentTargetState != null && !mxEvent.isAltDown(evt) && activeArrow == null)
		{
			// LATER: Use hit-detection for edges
			bbox = mxRectangle.fromRectangle(currentTargetState);
			
			if (graph.model.isEdge(currentTargetState.cell))
			{
				var pts = currentTargetState.absolutePoints;
				
				if (roundSource.parentNode != null)
				{
					var p0 = pts[0];
					bbox.add(checkArrow(x, y, new mxRectangle(p0.x - this.roundDrop.width / 2,
						p0.y - this.roundDrop.height / 2, this.roundDrop.width, this.roundDrop.height), roundSource));
				}
				
				if (roundTarget.parentNode != null)
				{
					var pe = pts[pts.length - 1];
					bbox.add(checkArrow(x, y, new mxRectangle(pe.x - this.roundDrop.width / 2,
						pe.y - this.roundDrop.height / 2,
						this.roundDrop.width, this.roundDrop.height), roundTarget));
				}
			}
			else
			{
				var bds = mxRectangle.fromRectangle(currentTargetState);
				
				// Uses outer bounding box to take rotation into account
				if (currentTargetState.shape != null && currentTargetState.shape.boundingBox != null)
				{
					bds = mxRectangle.fromRectangle(currentTargetState.shape.boundingBox);
				}

				bds.grow(this.graph.tolerance);
				bds.grow(HoverIcons.prototype.arrowSpacing);
				
				var handler = this.graph.selectionCellsHandler.getHandler(currentTargetState.cell);
				
				if (handler != null)
				{
					bds.x -= handler.horizontalOffset / 2;
					bds.y -= handler.verticalOffset / 2;
					bds.width += handler.horizontalOffset;
					bds.height += handler.verticalOffset;
					
					// Adds bounding box of rotation handle to avoid overlap
					if (handler.rotationShape != null && handler.rotationShape.node != null &&
						handler.rotationShape.node.style.visibility != 'hidden' &&
						handler.rotationShape.node.style.display != 'none' &&
						handler.rotationShape.boundingBox != null)
					{
						bds.add(handler.rotationShape.boundingBox);
					}
				}
				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleUp.width / 2,
					bds.y - this.triangleUp.height, this.triangleUp.width, this.triangleUp.height), arrowUp));
				bbox.add(checkArrow(x, y, new mxRectangle(bds.x + bds.width,
					currentTargetState.getCenterY() - this.triangleRight.height / 2,
					this.triangleRight.width, this.triangleRight.height), arrowRight));
				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleDown.width / 2,
						bds.y + bds.height, this.triangleDown.width, this.triangleDown.height), arrowDown));
				bbox.add(checkArrow(x, y, new mxRectangle(bds.x - this.triangleLeft.width,
						currentTargetState.getCenterY() - this.triangleLeft.height / 2,
						this.triangleLeft.width, this.triangleLeft.height), arrowLeft));
				
				
			}
			
			// Adds tolerance
			if (bbox != null)
			{
				bbox.grow(10);
			}
		}
		
		direction = mxConstants.DIRECTION_NORTH;
		
		if (activeArrow == arrowRight)
		{
			direction = mxConstants.DIRECTION_EAST;
		}
		else if (activeArrow == arrowDown || activeArrow == roundTarget)
		{
			direction = mxConstants.DIRECTION_SOUTH;
		}
		else if (activeArrow == arrowLeft)
		{
			direction = mxConstants.DIRECTION_WEST;
		}
		
		if (currentStyleTarget != null && activeArrow == styleTarget)
		{
			state = currentStyleTarget;
		}

		var validTarget = (firstVertex == null || graph.isCellConnectable(cells[firstVertex])) &&
			((graph.model.isEdge(cell) && firstVertex != null) ||
			(graph.model.isVertex(cell) && graph.isCellConnectable(cell)));
		
		// Drop arrows shown after this.dropTargetDelay, hidden after 5 secs, switches arrows after 500ms
		if ((currentTargetState != null && timeOnTarget >= 5000) ||
			(currentTargetState != state &&
			(bbox == null || !mxUtils.contains(bbox, x, y) ||
			(timeOnTarget > 500 && activeArrow == null && validTarget))))
		{
			activeTarget = false;
			currentTargetState = ((timeOnTarget < 5000 && timeOnTarget > this.dropTargetDelay) || graph.model.isEdge(cell)) ? state : null;

			if (currentTargetState != null && validTarget)
			{
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].parentNode != null)
					{
						elts[i].parentNode.removeChild(elts[i]);
					}
				}
				
				if (graph.model.isEdge(cell))
				{
					var pts = state.absolutePoints;
					
					if (pts != null)
					{
						var p0 = pts[0];
						var pe = pts[pts.length - 1];
						var tol = graph.tolerance;
						var box = new mxRectangle(x - tol, y - tol, 2 * tol, 2 * tol);
						
						roundSource.style.left = Math.floor(p0.x - this.roundDrop.width / 2) + 'px';
						roundSource.style.top = Math.floor(p0.y - this.roundDrop.height / 2) + 'px';
						
						roundTarget.style.left = Math.floor(pe.x - this.roundDrop.width / 2) + 'px';
						roundTarget.style.top = Math.floor(pe.y - this.roundDrop.height / 2) + 'px';
						
						if (graph.model.getTerminal(cell, true) == null)
						{
							graph.container.appendChild(roundSource);
						}
						
						if (graph.model.getTerminal(cell, false) == null)
						{
							graph.container.appendChild(roundTarget);
						}
					}
				}
				else
				{
					var bds = mxRectangle.fromRectangle(state);
					
					// Uses outer bounding box to take rotation into account
					if (state.shape != null && state.shape.boundingBox != null)
					{
						bds = mxRectangle.fromRectangle(state.shape.boundingBox);
					}

					bds.grow(this.graph.tolerance);
					bds.grow(HoverIcons.prototype.arrowSpacing);
					
					var handler = this.graph.selectionCellsHandler.getHandler(state.cell);
					
					if (handler != null)
					{
						bds.x -= handler.horizontalOffset / 2;
						bds.y -= handler.verticalOffset / 2;
						bds.width += handler.horizontalOffset;
						bds.height += handler.verticalOffset;
						
						// Adds bounding box of rotation handle to avoid overlap
						if (handler.rotationShape != null && handler.rotationShape.node != null &&
							handler.rotationShape.node.style.visibility != 'hidden' &&
							handler.rotationShape.node.style.display != 'none' &&
							handler.rotationShape.boundingBox != null)
						{
							bds.add(handler.rotationShape.boundingBox);
						}
					}
					
					arrowUp.style.left = Math.floor(state.getCenterX() - this.triangleUp.width / 2) + 'px';
					arrowUp.style.top = Math.floor(bds.y - this.triangleUp.height) + 'px';
					
					arrowRight.style.left = Math.floor(bds.x + bds.width) + 'px';
					arrowRight.style.top = Math.floor(state.getCenterY() - this.triangleRight.height / 2) + 'px';
					
					arrowDown.style.left = arrowUp.style.left
					arrowDown.style.top = Math.floor(bds.y + bds.height) + 'px';
					
					arrowLeft.style.left = Math.floor(bds.x - this.triangleLeft.width) + 'px';
					arrowLeft.style.top = arrowRight.style.top;
					
					if (state.style['portConstraint'] != 'eastwest')
					{
						graph.container.appendChild(arrowUp);
						graph.container.appendChild(arrowDown);
					}

					graph.container.appendChild(arrowRight);
					graph.container.appendChild(arrowLeft);
					
					
				}
				
				// Hides handle for cell under mouse
				if (state != null)
				{
					currentStateHandle = graph.selectionCellsHandler.getHandler(state.cell);
					
					if (currentStateHandle != null && currentStateHandle.setHandlesVisible != null)
					{
						currentStateHandle.setHandlesVisible(false);
					}
				}
				
				activeTarget = true;
			}
			else
			{
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].parentNode != null)
					{
						elts[i].parentNode.removeChild(elts[i]);
					}
				}
			}
		}

		if (!activeTarget && currentStateHandle != null)
		{
			currentStateHandle.setHandlesVisible(true);
		}
		
		// Handles drop target
		var target = ((!mxEvent.isAltDown(evt) || mxEvent.isShiftDown(evt)) &&
			!(currentStyleTarget != null && activeArrow == styleTarget)) ?
			mxDragSource.prototype.getDropTarget.apply(this, arguments) : null;
		var model = graph.getModel();
		
		if (target != null)
		{
			if (activeArrow != null || !graph.isSplitTarget(target, cells, evt))
			{
				// Selects parent group as drop target
				while (target != null && !graph.isValidDropTarget(target, cells, evt) && model.isVertex(model.getParent(target)))
				{
					target = model.getParent(target);
				}
				
				if (graph.view.currentRoot == target || (!graph.isValidRoot(target) &&
					graph.getModel().getChildCount(target) == 0) ||
					graph.isCellLocked(target) || model.isEdge(target))
				{
					target = null;
				}
			}
		}
		
		return target;
	});
	
	dragSource.stopDrag = function()
	{
		mxDragSource.prototype.stopDrag.apply(this, arguments);
		
		var elts = [roundSource, roundTarget, styleTarget, arrowUp, arrowRight, arrowDown, arrowLeft];
		
		for (var i = 0; i < elts.length; i++)
		{
			if (elts[i].parentNode != null)
			{
				elts[i].parentNode.removeChild(elts[i]);
			}
		}
		
		if (currentTargetState != null && currentStateHandle != null)
		{
			currentStateHandle.reset();
		}
		
		currentStateHandle = null;
		currentTargetState = null;
		currentStyleTarget = null;
		styleTargetParent = null;
		activeArrow = null;
	};
	
	return dragSource;
};
/**
 * Creates and returns a preview element for the given width and height.
 */
WfPanel.prototype.createDragPreview = function(width, height)
{//拖动时展示
	var elt = document.createElement('div');
	elt.style.border = this.dragPreviewBorder;
	elt.style.width = width + 'px';
	elt.style.height = height + 'px';
	
	return elt;
};
/**
 * Creates a drop handler for inserting the given cells.
 */
WfPanel.prototype.createDropHandler = function(cells, allowSplit, allowCellsInserted, bounds)
{
	allowCellsInserted = (allowCellsInserted != null) ? allowCellsInserted : true;
	
	return mxUtils.bind(this, function(graph, evt, target, x, y, force)
	{
		var elt = (force) ? null : ((mxEvent.isTouchEvent(evt) || mxEvent.isPenEvent(evt)) ?
			document.elementFromPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt)) :
			mxEvent.getSource(evt));
		
		while (elt != null && elt != this.container)
		{
			elt = elt.parentNode;
		}
		
		if (elt == null && graph.isEnabled())
		{
			cells = graph.getImportableCells(cells);
			
			if (cells.length > 0)
			{
				graph.stopEditing();
				
				// Holding alt while mouse is released ignores drop target
				var validDropTarget = (target != null && !mxEvent.isAltDown(evt)) ?
					graph.isValidDropTarget(target, cells, evt) : false;
				var select = null;

				if (target != null && !validDropTarget)
				{
					target = null;
				}
				
				if (!graph.isCellLocked(target || graph.getDefaultParent()))
				{
					graph.model.beginUpdate();
					try
					{
						x = Math.round(x);
						y = Math.round(y);
						
						// Splits the target edge or inserts into target group
						if (allowSplit && graph.isSplitTarget(target, cells, evt))
						{
							var clones = graph.cloneCells(cells);
							graph.splitEdge(target, clones, null,
								x - bounds.width / 2, y - bounds.height / 2);
							select = clones;
						}
						else if (cells.length > 0)
						{
							select = graph.importCells(cells, x, y, target);
						}
						
						// Executes parent layout hooks for position/order
						if (graph.layoutManager != null)
						{
							var layout = graph.layoutManager.getLayout(target);
							
							if (layout != null)
							{
								var s = graph.view.scale;
								var tr = graph.view.translate;
								var tx = (x + tr.x) * s;
								var ty = (y + tr.y) * s;
								
								for (var i = 0; i < select.length; i++)
								{
									layout.moveCell(select[i], tx, ty);
								}
							}
						}
	
						if (allowCellsInserted)
						{
							graph.fireEvent(new mxEventObject('cellsInserted', 'cells', select));
						}
					}
					finally
					{
						graph.model.endUpdate();
					}
	
					if (select != null && select.length > 0)
					{
						graph.scrollCellToVisible(select[0]);
						graph.setSelectionCells(select);
					}

					if (graph.editAfterInsert && evt != null && mxEvent.isMouseEvent(evt) &&
						select != null && select.length == 1)
					{
						window.setTimeout(function()
						{
							graph.startEditing(select[0]);
						}, 0);
					}
				}
			}
			
			mxEvent.consume(evt);
		}
	});
};
/**
 * Adds a handler for inserting the cell with a single click.
 */
WfPanel.prototype.addClickHandler = function(elt, ds, cells)
{
	var graph = this.editorUi.editor.graph;
	var oldMouseDown = ds.mouseDown;
	var oldMouseMove = ds.mouseMove;
	var oldMouseUp = ds.mouseUp;
	var tol = graph.tolerance;
	var first = null;
	var sb = this;
	
	ds.mouseDown =function(evt)
	{
		oldMouseDown.apply(this, arguments);
		first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
		
		if (this.dragElement != null)
		{
			this.dragElement.style.display = 'none';
			mxUtils.setOpacity(elt, 50);
		}
	};
	
	ds.mouseMove = function(evt)
	{
		if (this.dragElement != null && this.dragElement.style.display == 'none' &&
			first != null && (Math.abs(first.x - mxEvent.getClientX(evt)) > tol ||
			Math.abs(first.y - mxEvent.getClientY(evt)) > tol))
		{
			this.dragElement.style.display = '';
			mxUtils.setOpacity(elt, 100);
		}
		
		oldMouseMove.apply(this, arguments);
	};
	
	ds.mouseUp = function(evt)
	{
		if (!mxEvent.isPopupTrigger(evt) && this.currentGraph == null &&
			this.dragElement != null && this.dragElement.style.display == 'none')
		{
			sb.itemClicked(cells, ds, evt, elt);
		}

		oldMouseUp.apply(ds, arguments);
		mxUtils.setOpacity(elt, 100);
		first = null;
		
		// Blocks tooltips on this element after single click
		sb.currentElt = elt;
	};
};
/**
 * Adds a handler for inserting the cell with a single click.
 */
WfPanel.prototype.itemClicked = function(cells, ds, evt, elt)
{
	var graph = this.editorUi.editor.graph;
	graph.container.focus();
	
	// Alt+Click inserts and connects
	if (mxEvent.isAltDown(evt))
	{
		if (graph.getSelectionCount() == 1 && graph.model.isVertex(graph.getSelectionCell()))
		{
			var firstVertex = null;
			
			for (var i = 0; i < cells.length && firstVertex == null; i++)
			{
				if (graph.model.isVertex(cells[i]))
				{
					firstVertex = i;
				}
			}
			
			if (firstVertex != null)
			{
				graph.setSelectionCells(this.dropAndConnect(graph.getSelectionCell(), cells, (mxEvent.isMetaDown(evt) || mxEvent.isControlDown(evt)) ?
					(mxEvent.isShiftDown(evt) ? mxConstants.DIRECTION_WEST : mxConstants.DIRECTION_NORTH) : 
					(mxEvent.isShiftDown(evt) ? mxConstants.DIRECTION_EAST : mxConstants.DIRECTION_SOUTH),
					firstVertex, evt));
				graph.scrollCellToVisible(graph.getSelectionCell());
			}
		}
	}
	// Shift+Click updates shape
	else if (mxEvent.isShiftDown(evt) && !graph.isSelectionEmpty())
	{
		this.updateShapes(cells[0], graph.getSelectionCells());
		graph.scrollCellToVisible(graph.getSelectionCell());
	}
	else
	{
		var pt = graph.getFreeInsertPoint();
		if(cells[0].isRowGroup){
			pt.x = 50;
			cells[0].geometry.width = graph.pageFormat.width -100;
		}
		if(cells[0].isColGroup){
			pt.y = 0;
		}
		ds.drop(graph, evt, null, pt.x, pt.y, true);
		
		if (this.editorUi.hoverIcons != null && (mxEvent.isTouchEvent(evt) || mxEvent.isPenEvent(evt)))
		{
			this.editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
		}
	}
};
/**
 * Creates a drop handler for inserting the given cells.
 */
WfPanel.prototype.updateShapes = function(source, targets)
{
	var graph = this.editorUi.editor.graph;
	var sourceCellStyle = graph.getCellStyle(source);
	var result = [];
	
	graph.model.beginUpdate();
	try
	{
		var cellStyle = graph.getModel().getStyle(source);

		// Lists the styles to carry over from the existing shape
		var styles = ['shadow', 'dashed', 'dashPattern', 'fontFamily', 'fontSize', 'fontColor', 'align', 'startFill',
		              'startSize', 'endFill', 'endSize', 'strokeColor', 'strokeWidth', 'fillColor', 'gradientColor',
		              'html', 'part', 'noEdgeStyle', 'edgeStyle', 'elbow', 'childLayout', 'recursiveResize',
		              'container', 'collapsible', 'connectable'];
		
		for (var i = 0; i < targets.length; i++)
		{
			var targetCell = targets[i];
			
			if ((graph.getModel().isVertex(targetCell) == graph.getModel().isVertex(source)) ||
				(graph.getModel().isEdge(targetCell) == graph.getModel().isEdge(source)))
			{
				var state = graph.view.getState(targetCell);
				var style = (state != null) ? state.style : graph.getCellStyle(targets[i]);
				graph.getModel().setStyle(targetCell, cellStyle);
				
				// Removes all children of composite cells
				if (state != null && mxUtils.getValue(state.style, 'composite', '0') == '1')
				{
					var childCount = graph.model.getChildCount(targetCell);
					
					for (var j = childCount; j >= 0; j--)
					{
						graph.model.remove(graph.model.getChildAt(targetCell, j));
					}
				}

				if (style != null)
				{
					// Replaces the participant style in the lifeline shape with the target shape
					if (style[mxConstants.STYLE_SHAPE] == 'umlLifeline' &&
						sourceCellStyle[mxConstants.STYLE_SHAPE] != 'umlLifeline')
					{
						graph.setCellStyles(mxConstants.STYLE_SHAPE, 'umlLifeline', [targetCell]);
						graph.setCellStyles('participant', sourceCellStyle[mxConstants.STYLE_SHAPE], [targetCell]);
					}
					
					for (var j = 0; j < styles.length; j++)
					{
						var value = style[styles[j]];
						
						if (value != null)
						{
							graph.setCellStyles(styles[j], value, [targetCell]);
						}
					}
				}
				
				result.push(targetCell);
			}
		}
	}
	finally
	{
		graph.model.endUpdate();
	}
	
	return result;
};
/**
 * Creates a drag source for the given element.
 */
WfPanel.prototype.dropAndConnect = function(source, targets, direction, dropCellIndex, evt)
{
	var geo = this.getDropAndConnectGeometry(source, targets[dropCellIndex], direction, targets);
	
	// Targets without the new edge for selection
	var tmp = [];
	
	if (geo != null)
	{
		var graph = this.editorUi.editor.graph;
		var editingCell = null;

		graph.model.beginUpdate();
		try
		{
			var sourceGeo = graph.getCellGeometry(source);
			var geo2 = graph.getCellGeometry(targets[dropCellIndex]);

			// Handles special case where target should be ignored for stack layouts
			var targetParent = graph.model.getParent(source);
			var validLayout = true;
			
			// Ignores parent if it has a stack layout
			if (graph.layoutManager != null)
			{
				var layout = graph.layoutManager.getLayout(targetParent);
			
				// LATER: Use parent of parent if valid layout
				if (layout != null && layout.constructor == mxStackLayout)
				{
					validLayout = false;

					var tmp = graph.view.getState(targetParent);
					
					// Offsets by parent position
					if (tmp != null)
					{
						var offset = new mxPoint((tmp.x / graph.view.scale - graph.view.translate.x),
								(tmp.y / graph.view.scale - graph.view.translate.y));
						geo.x += offset.x;
						geo.y += offset.y;
						var pt = geo.getTerminalPoint(false);
						
						if (pt != null)
						{
							pt.x += offset.x;
							pt.y += offset.y;
						}
					}
				}
			}
			
			var dx = geo2.x;
			var dy = geo2.y;
			
			// Ignores geometry of edges
			if (graph.model.isEdge(targets[dropCellIndex]))
			{
				dx = 0;
				dy = 0;
			}
			
			var useParent = graph.model.isEdge(source) || (sourceGeo != null && !sourceGeo.relative && validLayout);
			targets = graph.importCells(targets, (geo.x - (useParent ? dx : 0)),
					(geo.y - (useParent ? dy : 0)), (useParent) ? targetParent : null);
			tmp = targets;
			
			if (graph.model.isEdge(source))
			{
				// Adds new terminal to edge
				// LATER: Push new terminal out radially from edge start point
				graph.model.setTerminal(source, targets[dropCellIndex], direction == mxConstants.DIRECTION_NORTH);
			}
			else if (graph.model.isEdge(targets[dropCellIndex]))
			{
				// Adds new outgoing connection to vertex and clears points
				graph.model.setTerminal(targets[dropCellIndex], source, true);
				var geo3 = graph.getCellGeometry(targets[dropCellIndex]);
				geo3.points = null;
				
				if (geo3.getTerminalPoint(false) != null)
				{
					geo3.setTerminalPoint(geo.getTerminalPoint(false), false);
				}
				else if (useParent && graph.model.isVertex(targetParent))
				{
					// Adds parent offset to other nodes
					var tmpState = graph.view.getState(targetParent);
					var offset = (tmpState.cell != graph.view.currentRoot) ?
						new mxPoint((tmpState.x / graph.view.scale - graph.view.translate.x),
						(tmpState.y / graph.view.scale - graph.view.translate.y)) : new mxPoint(0, 0);

					graph.cellsMoved(targets, offset.x, offset.y, null, null, true);
				}
			}
			else
			{
				geo2 = graph.getCellGeometry(targets[dropCellIndex]);
				dx = geo.x - Math.round(geo2.x);
				dy = geo.y - Math.round(geo2.y);
				geo.x = Math.round(geo2.x);
				geo.y = Math.round(geo2.y);
				graph.model.setGeometry(targets[dropCellIndex], geo);
				graph.cellsMoved(targets, dx, dy, null, null, true);
				tmp = targets.slice();
				editingCell = (tmp.length == 1) ? tmp[0] : null;
				targets.push(graph.insertEdge(null, null, '', source, targets[dropCellIndex],
					graph.createCurrentEdgeStyle()));
			}
			
			graph.fireEvent(new mxEventObject('cellsInserted', 'cells', targets));
		}
		finally
		{
			graph.model.endUpdate();
		}
		
		if (graph.editAfterInsert && evt != null && mxEvent.isMouseEvent(evt) &&
			editingCell != null)
		{
			window.setTimeout(function()
			{
				graph.startEditing(editingCell);
			}, 0);
		}
	}
	
	return tmp;
};
/**
 * Creates a drag source for the given element.
 */
WfPanel.prototype.getDropAndConnectGeometry = function(source, target, direction, targets)
{
	var graph = this.editorUi.editor.graph;
	var view = graph.view;
	var keepSize = targets.length > 1;
	var geo = graph.getCellGeometry(source);
	var geo2 = graph.getCellGeometry(target);
	
	if (geo != null && geo2 != null)
	{
		geo2 = geo2.clone();

		if (graph.model.isEdge(source))
		{
			var state = graph.view.getState(source);
			var pts = state.absolutePoints;
			var p0 = pts[0];
			var pe = pts[pts.length - 1];
			
			if (direction == mxConstants.DIRECTION_NORTH)
			{
				geo2.x = p0.x / view.scale - view.translate.x - geo2.width / 2;
				geo2.y = p0.y / view.scale - view.translate.y - geo2.height / 2;
			}
			else
			{
				geo2.x = pe.x / view.scale - view.translate.x - geo2.width / 2;
				geo2.y = pe.y / view.scale - view.translate.y - geo2.height / 2;
			}
		}
		else
		{
			if (geo.relative)
			{
				var state = graph.view.getState(source);
				geo = geo.clone();
				geo.x = (state.x - view.translate.x) / view.scale;
				geo.y = (state.y - view.translate.y) / view.scale;
			}
			
			var length = graph.defaultEdgeLength;
			
			// Maintains edge length
			if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null && geo2.getTerminalPoint(false) != null)
			{
				var p0 = geo2.getTerminalPoint(true);
				var pe = geo2.getTerminalPoint(false);
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;
				
				length = Math.sqrt(dx * dx + dy * dy);
				
				geo2.x = geo.getCenterX();
				geo2.y = geo.getCenterY();
				geo2.width = 1;
				geo2.height = 1;
				
				if (direction == mxConstants.DIRECTION_NORTH)
				{
					geo2.height = length
					geo2.y = geo.y - length;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
				}
				else if (direction == mxConstants.DIRECTION_EAST)
				{
					geo2.width = length
					geo2.x = geo.x + geo.width;
					geo2.setTerminalPoint(new mxPoint(geo2.x + geo2.width, geo2.y), false);
				}
				else if (direction == mxConstants.DIRECTION_SOUTH)
				{
					geo2.height = length
					geo2.y = geo.y + geo.height;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y + geo2.height), false);
				}
				else if (direction == mxConstants.DIRECTION_WEST)
				{
					geo2.width = length
					geo2.x = geo.x - length;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
				}
			}
			else
			{
				// Try match size or ignore if width or height < 45 which
				// is considered special enough to be ignored here
				if (!keepSize && geo2.width > 45 && geo2.height > 45 &&
					geo.width > 45 && geo.height > 45)
				{
					geo2.width = geo2.width * (geo.height / geo2.height);
					geo2.height = geo.height;
				}
	
				geo2.x = geo.x + geo.width / 2 - geo2.width / 2;
				geo2.y = geo.y + geo.height / 2 - geo2.height / 2;

				if (direction == mxConstants.DIRECTION_NORTH)
				{
					geo2.y = geo2.y - geo.height / 2 - geo2.height / 2 - length;
				}
				else if (direction == mxConstants.DIRECTION_EAST)
				{
					geo2.x = geo2.x + geo.width / 2 + geo2.width / 2 + length;
				}
				else if (direction == mxConstants.DIRECTION_SOUTH)
				{
					geo2.y = geo2.y + geo.height / 2 + geo2.height / 2 + length;
				}
				else if (direction == mxConstants.DIRECTION_WEST)
				{
					geo2.x = geo2.x - geo.width / 2 - geo2.width / 2 - length;
				}
				
				// Adds offset to match cells without connecting edge
				if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null && target.getTerminal(false) != null)
				{
					var targetGeo = graph.getCellGeometry(target.getTerminal(false));
					
					if (targetGeo != null)
					{
						if (direction == mxConstants.DIRECTION_NORTH)
						{
							geo2.x -= targetGeo.getCenterX();
							geo2.y -= targetGeo.getCenterY() + targetGeo.height / 2;
						}
						else if (direction == mxConstants.DIRECTION_EAST)
						{
							geo2.x -= targetGeo.getCenterX() - targetGeo.width / 2;
							geo2.y -= targetGeo.getCenterY();
						}
						else if (direction == mxConstants.DIRECTION_SOUTH)
						{
							geo2.x -= targetGeo.getCenterX();
							geo2.y -= targetGeo.getCenterY() - targetGeo.height / 2;
						}
						else if (direction == mxConstants.DIRECTION_WEST)
						{
							geo2.x -= targetGeo.getCenterX() + targetGeo.width / 2;
							geo2.y -= targetGeo.getCenterY();
						}
					}
				}
			}
		}
	}
	
	return geo2;
};
/**
 * Adds all palettes to the sidebar.
 */
WfPanel.prototype.showTooltip = function(elt, cells, w, h, title, showLabel)
{
	if (this.enableTooltips && this.showTooltips)
	{
		if (this.currentElt != elt)
		{
			if (this.thread != null)
			{
				window.clearTimeout(this.thread);
				this.thread = null;
			}
			
			var show = mxUtils.bind(this, function()
			{
				// Lazy creation of the DOM nodes and graph instance
				if (this.tooltip == null)
				{
					this.tooltip = document.createElement('div');
					this.tooltip.className = 'geSidebarTooltip';
					this.tooltip.style.zIndex = mxPopupMenu.prototype.zIndex - 1;
					document.body.appendChild(this.tooltip);
					
					this.graph2 = new Graph(this.tooltip, null, null, this.editorUi.editor.graph.getStylesheet());
					this.graph2.resetViewOnRootChange = false;
					this.graph2.foldingEnabled = false;
					this.graph2.gridEnabled = false;
					this.graph2.autoScroll = false;
					this.graph2.setTooltips(false);
					this.graph2.setConnectable(false);
					this.graph2.setEnabled(false);
					
					if (!mxClient.IS_SVG)
					{
						this.graph2.view.canvas.style.position = 'relative';
					}
					
					this.tooltipImage = mxUtils.createImage(this.tooltipImage);
					this.tooltipImage.className = 'geSidebarTooltipImage';
					this.tooltipImage.style.zIndex = mxPopupMenu.prototype.zIndex - 1;
					this.tooltipImage.style.position = 'absolute';
					this.tooltipImage.style.width = '14px';
					this.tooltipImage.style.height = '27px';
					
					// document.body.appendChild(this.tooltipImage); //去掉悬浮在节点图形上时提示区域的一个尖角符号 *********************************
				}
				
				this.graph2.model.clear();
				this.graph2.view.setTranslate(this.tooltipBorder, this.tooltipBorder);

				if (w > this.maxTooltipWidth || h > this.maxTooltipHeight)
				{
					this.graph2.view.scale = Math.round(Math.min(this.maxTooltipWidth / w, this.maxTooltipHeight / h) * 100) / 100;
				}
				else
				{
					this.graph2.view.scale = 1;
				}
				
				this.tooltip.style.display = 'block';
				this.graph2.labelsVisible = (showLabel == null || showLabel);
				var fo = mxClient.NO_FO;
				mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
				this.graph2.addCells(cells);
				mxClient.NO_FO = fo;
				
				var bounds = this.graph2.getGraphBounds();
				var width = bounds.width + 2 * this.tooltipBorder + 4;
				var height = bounds.height + 2 * this.tooltipBorder;
				
				if (mxClient.IS_QUIRKS)
				{
					height += 4;
					this.tooltip.style.overflow = 'hidden';
				}
				else
				{
					this.tooltip.style.overflow = 'visible';
				}

				this.tooltipImage.style.visibility = 'visible';
				this.tooltip.style.width = width + 'px';
				
				// Adds title for entry
				if (this.tooltipTitles && title != null && title.length > 0)
				{
					if (this.tooltipTitle == null)
					{
						this.tooltipTitle = document.createElement('div');
						this.tooltipTitle.style.borderTop = '1px solid gray';
						this.tooltipTitle.style.textAlign = 'center';
						this.tooltipTitle.style.width = '100%';
						
						// Oversize titles are cut-off currently. Should make tooltip wider later.
						this.tooltipTitle.style.overflow = 'hidden';
						this.tooltipTitle.style.position = 'absolute';
						this.tooltipTitle.style.paddingTop = '6px';
						this.tooltipTitle.style.bottom = '6px';

						this.tooltip.appendChild(this.tooltipTitle);
					}
					else
					{
						this.tooltipTitle.innerHTML = '';
					}
					
					this.tooltipTitle.style.display = '';
					mxUtils.write(this.tooltipTitle, title);
					
					var ddy = this.tooltipTitle.offsetHeight + 10;
					height += ddy;
					
					if (mxClient.IS_SVG)
					{
						this.tooltipTitle.style.marginTop = (2 - ddy) + 'px';
					}
					else
					{
						height -= 6;
						this.tooltipTitle.style.top = (height - ddy) + 'px';	
					}
				}
				else if (this.tooltipTitle != null && this.tooltipTitle.parentNode != null)
				{
					this.tooltipTitle.style.display = 'none';
				}
				
				this.tooltip.style.height = height + 'px';
				var x0 = -Math.round(bounds.x - this.tooltipBorder);
				var y0 = -Math.round(bounds.y - this.tooltipBorder);
				
				var b = document.body;
				var d = document.documentElement;
				var off = this.getTooltipOffset();
				var bottom = Math.max(b.clientHeight || 0, d.clientHeight);
				var left = this.container.clientWidth + this.editorUi.splitSize + 3 + this.editorUi.container.offsetLeft + off.x;
				var top = Math.min(bottom - height - 20 /*status bar*/, Math.max(0, (this.editorUi.container.offsetTop +
					this.container.offsetTop + elt.offsetTop - this.container.scrollTop - height / 2 + 16))) + off.y;

				if (mxClient.IS_SVG)
				{
					if (x0 != 0 || y0 != 0)
					{
						this.graph2.view.canvas.setAttribute('transform', 'translate(' + x0 + ',' + y0 + ')');
					}
					else
					{
						this.graph2.view.canvas.removeAttribute('transform');
					}
				}
				else
				{
					this.graph2.view.drawPane.style.left = x0 + 'px';
					this.graph2.view.drawPane.style.top = y0 + 'px';
				}
				
				// Workaround for ignored position CSS style in IE9
				// (changes to relative without the following line)
				this.tooltip.style.position = 'absolute';
				// this.tooltip.style.left = left + 'px';
				this.tooltip.style.top = top + 100 + 'px';
				this.tooltipImage.style.left = (left - 13) + 'px';
				this.tooltipImage.style.top = (top + height / 2 - 13) + 'px';
			});

			if (this.tooltip != null && this.tooltip.style.display != 'none')
			{
				show();
			}
			else
			{
				this.thread = window.setTimeout(show, this.tooltipDelay);
			}

			this.currentElt = elt;
		}
	}
};
/**
 * Adds all palettes to the sidebar.
 */
WfPanel.prototype.getTooltipOffset = function()
{
	return new mxPoint(0, 0);
};