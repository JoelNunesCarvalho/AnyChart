if(!_.theme_map){_.theme_map=1;(function($){$.xa($.y.anychart.themes.defaultTheme,{map:{defaultCalloutSettings:{},defaultSeriesSettings:{base:{fill:function(){return this.scaledColor||this.sourceColor},hoverFill:"#757575",selectFill:"#333 0.85",stroke:$.mG,hoverStroke:{thickness:.5,color:"#545f69"},selectStroke:{thickness:.5,color:"#545f69"},hatchFill:!1,labels:{anchor:"center-bottom",enabled:null,adjustFontSize:{width:!0,height:!0},format:function(){return this.getData("name")||this.name||this.getData("id")||"lat: "+this.lat+"\nlong: "+this["long"]}},
hoverLabels:{enabled:null},selectLabels:{enabled:null},markers:{enabled:!1,disablePointerEvents:!1},hoverMarkers:{enabled:null},selectMarkers:{enabled:null},color:null,tooltip:{titleFormat:function(){return this.getData("name")||this.name||"Tooltip title"},format:function(){return"Id: "+this.id+"\nValue: "+this.valuePrefix+$.dG(this.value)+this.valuePostfix}},xScale:null,yScale:null,a11y:{titleFormat:"Series named {%SeriesName}"},clip:!1},choropleth:{labels:{fontColor:"#212121",anchor:"center"},markers:{anchor:null},
colorScale:{}},connector:{startSize:0,endSize:0,curvature:.3,stroke:function(){return{thickness:2,color:this.sourceColor,lineJoin:"round"}},hoverStroke:$.nG,selectStroke:"2 #333 0.85",markers:{position:"middle",enabled:!0,size:15,stroke:"1.5 #f7f7f7",rotation:null,anchor:null,type:"arrowhead"},hoverMarkers:{stroke:"1.5 #f7f7f7",size:15},selectMarkers:{fill:"#333 0.85",stroke:"1.5 #f7f7f7",size:15},labels:{enabled:!1,position:"middle",anchor:null,format:function(){return"from: "+this.startPoint.lat+
","+this.startPoint["long"]+"\nto: "+this.endPoint.lat+","+this.endPoint["long"]}},tooltip:{title:{enabled:!1},separator:{enabled:!1},format:function(){return"from: "+this.startPoint.lat+", "+this.startPoint["long"]+"\nto: "+this.endPoint.lat+", "+this.endPoint["long"]}}},bubble:{stroke:function(){return{thickness:2,color:$.Yl(this.sourceColor)}},labels:{anchor:"center"},hoverFill:"#757575",selectFill:"#333 0.85",tooltip:{format:function(){var a;a=this.id?"Id: "+this.id:"lat: "+this.lat+"\nlong: "+
this["long"];this.size&&(a+="\nValue: "+this.valuePrefix+$.dG(this.size)+this.valuePostfix);return a}}},marker:{labels:{enabled:!0},hoverLabels:{fontWeight:"bold"},selectLabels:{fontWeight:"bold"},tooltip:{format:function(){var a;a=this.id?"Id: "+this.id:"lat: "+this.lat+"\nlong: "+this["long"];this.value&&(a+="\nValue: "+this.valuePrefix+$.dG(this.value)+this.valuePostfix);return a}}}},colorRange:{zIndex:50},geoScale:{maxTicksCount:1E3,precision:2},callouts:[],axesSettings:{enabled:!1,title:{padding:5,
fontSize:13,text:"Axis title",fontColor:"#545f69",zIndex:35},labels:{enabled:!0,padding:2,rotation:null,fontSize:10,anchor:"auto"},minorLabels:{padding:2,rotation:null,fontSize:9,anchor:null},overlapMode:"no-overlap",ticks:{enabled:!0,length:5,position:"outside",stroke:"#CECECE"},minorTicks:{enabled:!1,length:2,position:"outside",stroke:"#CECECE"},drawFirstLabel:!0,drawLastLabel:!0,stroke:"#CECECE"},gridsSettings:{enabled:!1,drawFirstLine:!0,drawLastLine:!0,oddFill:"none",evenFill:"none",stroke:"#CECECE",
minorStroke:"none",zIndex:5},crosshair:{enabled:!1,xStroke:"#969EA5",yStroke:"#969EA5",zIndex:110,xLabel:{axisIndex:2},yLabel:{axisIndex:3}},unboundRegions:{enabled:!0,fill:"#F7F7F7",stroke:"#e0e0e0"},maxBubbleSize:"20%",minBubbleSize:"5%",geoIdField:"id",interactivity:{copyFormat:function(a){a=a.seriesStatus;for(var b="",c=0,d=a.length;c<d;c++){var e=a[c];if(e.points.length){for(var b=b+("Series "+e.series.va()+":\n"),f=0,h=e.points.length;f<h;f++){var k=e.points[f],b=b+("id: "+k.id+" index: "+k.index);
f!=h-1&&(b+="\n")}c!=d-1&&(b+="\n")}}return b||"no selected points"},drag:!0,zoomOnMouseWheel:!1,keyboardZoomAndMove:!0,zoomOnDoubleClick:!1},minZoomLevel:1,maxZoomLevel:10,overlapMode:"no-overlap",crsAnimation:{enabled:!0,duration:300},legend:{enabled:!1,tooltip:{contentInternal:{background:{disablePointerEvents:!1}}}}},choropleth:{},bubbleMap:{},markerMap:{},connector:{},seatMap:{}});})($)}
