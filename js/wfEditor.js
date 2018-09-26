var workflowUi;
function WfPanel(editorUi, container) {
    this.editorUi = editorUi;
    workflowUi = editorUi;
	this.container = container;
    this.palettes = new Object();
    // this.siderBar = new Sidebar(editorUi, container);
    this.showTooltips = true;
	this.graph = editorUi.createTemporaryGraph(this.editorUi.editor.graph.getStylesheet());
	this.graph.cellRenderer.antiAlias = false;
	this.graph.foldingEnabled = false;
	this.graph.container.style.visibility = 'hidden';
	document.body.appendChild(this.graph.container);
    this.init();
    this.setTipInfoBtn();
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
    // ----------------------
}
WfPanel.prototype.init = function (){

    WfPanel.prototype.triangleUp = HoverIcons.prototype.triangleUp;
    WfPanel.prototype.triangleRight = HoverIcons.prototype.triangleRight;
    WfPanel.prototype.triangleDown = HoverIcons.prototype.triangleDown;
    WfPanel.prototype.triangleLeft = HoverIcons.prototype.triangleLeft;
    WfPanel.prototype.refreshTarget = HoverIcons.prototype.refreshTarget;
    WfPanel.prototype.roundDrop = HoverIcons.prototype.roundDrop;

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
绘制每个操作项及方法
 */
WfPanel.prototype.drawActions = function(){
    let iconActions = this.editorUi.actions;
    var _this = this;
    let icons = [ //所有的操作按钮
        {icon:'icon-workflow-baocun',action:iconActions.get('save'),title:'save'},
        {icon:'icon-workflow-daochu',action:iconActions.get('export'),title:'export'},
        {icon:'icon-workflow-chexiao',action:iconActions.get('undo'),title:'undo'},
        {icon:'icon-workflow-fanhui',action:iconActions.get('redo'),title:'redo'},
        {icon:'icon-workflow-shanchu',action:iconActions.get('delete'),title:'delete'},

        // {icon:'icon-workflow-chuangjian',action:'',title:''},
        // {icon:'icon-workflow-chuli',action:'',title:''},
        // {icon:'icon-workflow-shenpi',action:'',title:''},
        // {icon:'icon-workflow-fencha',action:'',title:''},
        // {icon:'icon-workflow-fenchazhongjiandian',action:'',title:''},
        // {icon:'icon-workflow-hebing',action:'',title:''},
        // {icon:'icon-workflow-guidang',action:'',title:''},

        {icon:'icon-workflow-tianjiafenzu',action:'',title:'添加分组'},
        {icon:'icon-workflow-ziti',action:'',title:'字体'},
        {icon:'icon-workflow-hengxiangfenzu',action:{funct:this.drawRowGroup.bind(this)},title:'横向分组'},
        {icon:'icon-workflow-zongxiangfenzu',action:'',title:'纵向分组'},

        {icon:'icon-workflow-kaozuoduiqi',action:'1',title:'左对齐'},
        {icon:'icon-workflow-shangxiadengjian',action:'1',title:'垂直居中'},
        {icon:'icon-workflow-kaoyouduiqi',action:'1',title:'右对齐'},
        {icon:'icon-workflow-kaoshangduiqi',action:'1',title:'上对齐'},
        {icon:'icon-workflow-zuoyoudengjian',action:'1',title:'水平居中'},
        {icon:'icon-workflow-kaoxiaduiqi',action:'1',title:'下对齐'},

        {icon:'icon-workflow-biaochi',action:'1',title:'标尺'},
        {icon:'icon-workflow-wangge',action:'1',title:'网格'},
        {icon:'icon-workflow-xianshifenzu',action:{funct:_this.setTipInfoShow},title:'显示分组'},
        {icon:'icon-workflow-huifuyuanbil',action:iconActions.get('resetView'),title:'恢复原比例'},
        {icon:'icon-workflow-suoxiao',action:iconActions.get('zoomOut'),title:'缩小'},
        {icon:'icon-workflow-fangda',action:iconActions.get('zoomIn'),title:'放大'},

        {icon:'icon-workflow-ceshi',action:'',title:''},
        {icon:'icon-workflow-tingzhi',action:'',title:''},
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
		let spanEl;
		if(v.icon === 'icon-workflow-tianjiafenzu'){//添加分组
			spanEl = this.drawGroup();
		}else{
        	spanEl = document.createElement('span');
		}
        spanEl.className = `${v.icon} icon-workflow`;
        spanEl.title = v.title || 'title';
        spanEl.onclick = function(e){
            v.action&&_this.setIconsActions(v.action,e,v.icon);
        }
        elDiv.appendChild(spanEl);
		// scale range
        if(i==19){
            let input = document.createElement('INPUT');
            input.type = 'range';
            input.className = 'wf-view-range';
            input.onclick = (val)=>{console.log('click',val,input)};
            input.onchange = function(val){
                console.log(val,'vvvvvv')
            }
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
		icon=='icon-workflow-shangxiadengjian' && graph.alignCells(mxConstants.ALIGN_MIDDLE);
		icon=='icon-workflow-kaoyouduiqi' && graph.alignCells(mxConstants.ALIGN_RIGHT);
		icon=='icon-workflow-kaoshangduiqi' && graph.alignCells(mxConstants.ALIGN_TOP);
		icon=='icon-workflow-zuoyoudengjian' && graph.alignCells(mxConstants.ALIGN_CENTER);
		icon=='icon-workflow-kaoxiaduiqi' && graph.alignCells(mxConstants.ALIGN_BOTTOM);
	}else{
        func.funct(evt);
        if(icon=='icon-workflow-suoxiao' || icon=='icon-workflow-fangda' || icon=='icon-workflow-huifuyuanbil'){//修改操作区域显示缩放值
            var tips = document.getElementsByClassName('action-area-tip')[4];
            tips.innerHTML = `视图（${graph.view.scale*100}%）`
        }
    }
}
/**
绘制横向分组
 */
WfPanel.prototype.drawRowGroup = function(){
	var cells,
		title='分组',
		showLabel='分组',
		showTitle='分组',
		width=300,height=200,
		allowCellsInserted,icon,
		style=`rounded=1;arcSize=10;fillColor=none;dashed=1;strokeColor=#666666;strokeWidth=2;labelPosition=center;verticalLabelPosition=top;
		align=center;verticalAlign=bottom;connectable=0;fontSize=18;fontStyle=1;fontFamily='宋体';`;
	cells = [new mxCell( '分组', new mxGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	var element = this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted,icon,true);
	console.log(element,'element');
}
/**
绘制横向分组
 */
WfPanel.prototype.drawColGroup = function(){

}
/**
区域分组按钮
 */
WfPanel.prototype.drawGroup = function(){
	var cells,
		title='分组',
		showLabel='分组',
		showTitle='分组',
		width=300,height=200,
		allowCellsInserted,icon,
		style=`rounded=1;arcSize=10;fillColor=none;dashed=1;strokeColor=#666666;strokeWidth=2;labelPosition=center;verticalLabelPosition=top;
		align=center;verticalAlign=bottom;connectable=0;fontSize=18;fontStyle=1;fontFamily='宋体';`;
	cells = [new mxCell( '分组', new mxGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	var element = this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted,icon,true);
	return element;
}
/**
控制每块操作区域提示语
 */
WfPanel.prototype.setTipInfoBtn = function(){
    let tipBtn = document.createElement('button');
    tipBtn.innerHTML = 'show tip'
    tipBtn.onclick = this.setTipInfoShow;
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
	 	this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;html=1;icons={"right":"icon-workflow-ceshi"};'+wfStrokeStyle, 110, 70, '创建人', '创建', null, null, 'rounded rect rectangle box','icon-workflow-chuangjian'),
	 	this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-fencha","right":"icon-workflow-fencha"};'+wfStrokeStyle, 110, 70, '处理', '处理', null, null, 'rect rectangle box','icon-workflow-chuli'),
        this.createVertexTemplateEntry('rhombus;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-fencha","right":"icon-workflow-fencha"};'+wfStrokeStyle, 130, 80, '审批', '审批', null, null, 
        'diamond rhombus if condition decision conditional question test','icon-workflow-shenpi'),

        this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-fencha","right":"icon-workflow-fencha"};'+wfStrokeStyle, 110, 70,
        //  `<span class='icon-workflow-fencha icon-left-style'></span>分叉<span class='icon-workflow-fencha icon-right-style'></span>`, `分叉`,
         `分叉`, `分叉`,
         null, null, 'rect rectangle box','icon-workflow-fencha'),
        this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-fencha","right":"icon-workflow-fencha"};'+wfStrokeStyle, 110, 70, '分叉中间点', '分叉中间点', null, null, 'rect rectangle box','icon-workflow-fenchazhongjiandian'),
        this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;icons={"left":"icon-workflow-fencha","right":"icon-workflow-fencha"};'+wfStrokeStyle, 110, 70, '合并节点', '合并节点', null, null, 'rect rectangle box','icon-workflow-hebing'),

	 	// Explicit strokecolor/fillcolor=none is a workaround to maintain transparent background regardless of current style
            // this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;',
            //     40, 20, 'Text', '', null, null, 'text textbox textarea label','icon-workflow-fencha'),
            // this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;', 190, 120,
            //     '<h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
            //     'Textbox', null, null, 'text textbox textarea','icon-workflow-fenchazhongjiandian'),
            // this.createVertexTemplateEntry('shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;', 120, 60, '', 'Process', null, null, 'process task','icon-workflow-hebing'),
	 	
	 	// 自定义
		this.addEntry('shape group container', function()
		{
		    var cell = new mxCell(`<span class='icon-workflow-chuli' style="font-size:20px";></span>`, new mxGeometry(0, 0, 110, 70),
				'rounded=0;whiteSpace=wrap;html=1;'+wfStrokeStyle);
		    cell.vertex = true;
		    
			var symbol = new mxCell('', new mxGeometry(20, 15, 20, 30), 'triangle;html=1;whiteSpace=wrap;');
			symbol.vertex = true;
			cell.insert(symbol);
	    	
    		return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Shape Group','','','','icon-workflow-guidang');
		})
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
WfPanel.prototype.createVertexTemplateEntry = function(style, width, height, value, title, showLabel, showTitle, tags,icon)
{
	tags = (tags != null && tags.length > 0) ? tags : title.toLowerCase();
	
	return this.addEntry(tags, mxUtils.bind(this, function()
 	{
 		return this.createVertexTemplate(style, width, height, value, title, showLabel, showTitle,'',icon);
 	}));
}
/**
 * Creates a drop handler for inserting the given cells.
 */
WfPanel.prototype.createVertexTemplate = function(style, width, height, value, title, showLabel, showTitle, allowCellsInserted,icon)
{
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
	cells[0].vertex = true;
	
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
				!isGroup && bds.grow(HoverIcons.prototype.arrowSpacing);
				
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
				if(!isGroup){
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
					
					if(!isGroup){
						if (state.style['portConstraint'] != 'eastwest')
						{
							graph.container.appendChild(arrowUp);
							graph.container.appendChild(arrowDown);
						}

						graph.container.appendChild(arrowRight);
						graph.container.appendChild(arrowLeft);
					}
					
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
					
					document.body.appendChild(this.tooltipImage);
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