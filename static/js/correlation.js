var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
      .velocityDecay(0.4)                                                     //摩擦
    .force('charge', d3.forceManyBody())                                      //詳細設定は後で
    .force('link', d3.forceLink().id(function(d) { return d.id; }))          //詳細設定は後で
    .force('colllision',d3.forceCollide(40))                                 //nodeの衝突半径：Nodeの最大値と同じ
    .force('positioningX',d3.forceX())                                        //詳細設定は後で
    .force('positioningY',d3.forceY())                                        //詳細設定は後で
    .force('center', d3.forceCenter(width / 2, height / 2));                  //重力の中心

//使用するnode図形形状定義(中心座標は(0,0))
var Defs = svg.append("defs");

//Circle
var figCircle = Defs.append('circle')
      .attr("id","circle")
      .attr('r', 20);   //5⇒20

//Rect
var figRect = Defs.append('rect')
      .attr("id","rect")
      .attr('width', 40)
      .attr('height', 30)
      .attr('rx', 7)  //角を丸める
      .attr('ry', 7)  //角を丸める
      .attr('x', -(40/2))  //circleと中心を合わせる
      .attr('y', -(30/2));  //circleと中心を合わせる

//Ellipse
var figEllipse = Defs.append('ellipse')
      .attr("id","ellipse")
      .attr('rx', 30)
      .attr('ry', 20);

// hexagon ※pointsは反時計回りで定義すると他の図形と記述の順番の整合が取れる
var figHexagon = Defs.append('polygon')
      .attr("id","hexagon")
      .attr('points', "0,20 -17.3,10 -17.3,-10 0,-20 17.3,-10 17.3,10");

//"svg"にZoomイベントを設定
var zoom = d3.zoom()
  .scaleExtent([1/4,4])
  .on('zoom', SVGzoomed);

svg.call(zoom);

//"svg"上に"g"をappendしてdragイベントを設定
var g = svg.append("g")
  .call(d3.drag()
  .on('drag',SVGdragged))

function SVGzoomed() {
  g.attr("transform", d3.event.transform);
}

function SVGdragged(d) {
  d3.select(this).attr('cx', d.x = d3.event.x).attr('cy', d.y = d3.event.y);
    };

d3.json("static/test_data.json", function(error, graph) {
  if (error) throw error;

//linkの定義
  var link = g.append("g")  //svg⇒gに
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke","#999")  //輪郭線の色指定追加
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
      .on('mouseover', function(){d3.select(this).attr('stroke', 'red');}) //カーソルが合ったら赤に
      .on('mouseout', function(){d3.select(this).attr('stroke', "#999");}) //カーソルが外れたら元の色に
      .call(d3.drag()　              //無いとエラーになる。。
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

// nodeの定義
  var node = g.append('g')
      .attr('class', 'nodes')
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
    .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

/*
// node circleの定義
  node.append('circle')
    .attr('r', 20)   //5⇒20
    .attr('stroke', '#ccc')
    .attr('fill', function(d) { return color(d.group); })
    .style('stroke-width', '2');  //線の太さ
*/

// node 図形の定義
  node.append("use")
    .attr("xlink:href",function(d) {return "#"+ nodeTypeID(d.group)})        //図形判定
    .attr('stroke', '#ccc')
    .attr('fill', function(d) { return color(d.group); })
    .style('stroke-width', '2')  //線の太さ
    .style('stroke-dasharray',function(d){return stroke_dasharrayCD(d)})  //破線判定
    .on('mouseover', function(){d3.select(this).attr('fill', 'red')})  //カーソルが合ったら赤に
    .on('mouseout', function(){d3.select(this).attr('fill', function(d) { return color(d.group); })}) //カーソルが外れたら元の色に

//node textの定義
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .style('pointer-events', 'none')
    .attr('font-size', function(d) {return '10px'; }  )
    .attr('font-weight', function(d) { return 'bold'; }  )
    .text(function(d) { return d.id; });


  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .distance(200) //Link長
      .links(graph.links);

  simulation.force('charge')
      .strength(function(d) {return -300})              //node間の力

  simulation.force('positioningX')                      //X方向の中心に向けた引力
      .strength(0.04)

  simulation.force('positioningY')                      //Y方向の中心に向けた引力
      .strength(0.04)

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')'}) //nodesの要素が連動して動くように設定
  }
});

//破線判定
function stroke_dasharrayCD(d){
    var arr = [2,4,6,7,9,10,11,12,0]
    if (arr.indexOf(d.group) >= 0) {
      return "3 2"  //3:2の破線
    }
    else {
      return "none"  //破線なし
    }
}

//図形判定
  function nodeTypeID(d){
    var nodetype
    var arrRect = [3,4]
    var arrEllipse = [5,6,7]
    var arrHexagon = [9,10,11,12,0]

    if(arrRect.indexOf(d) >= 0){
      //Rect
      return "rect"
    }
    else if(arrEllipse.indexOf(d) >= 0){
      //Ellipse
      return "ellipse"
    }
    else if(arrHexagon.indexOf(d) >= 0){
      //Hexagon
      return "hexagon"
    }
    else{
      //Circle
      return "circle"
    }
  }

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}