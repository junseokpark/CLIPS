Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

$(document).ready(function() {
  $('.group').click(function() {
    if($(this).attr('class').indexOf('active') != -1) {
      $(this).removeClass('active');
      $(this).css('background-color', 'white');
    } else {
      $(this).addClass('active');
      $(this).css('background-color', 'white');
    }
  })

  data = { "name": 'type' };
  var json = {}, parentNode = [], nodeArr = [], index = 0, semanticFilters = [], semanticFiltersIndex = 0;

  var totalData = {};
  totalData.nodes = ["type", "primary_purpose", "endpoint_classification", "enrollment_type", "gender", "is_health_volunteers", "model", "allocation", "masking", "masked_role", "time_perspective", "design_group", "sampling_method"];

  $('#send-order-btn').click(function() {
    $('.sub-sortable-text').each(function(index) {
      totalData.nodes[index] = $(this).text().toLowerCase();
    })

    index = 0;

    data = { "name": $('.sub-sortable-text').eq(0).text().toLowerCase() };

    node = d3.hierarchy(data, function(d) {
      return d.children;
    });
    node = tree(node);

    console.log(totalData.nodes);

    update();
  }).one('click', function() {
    $('#ban-bg').fadeOut(300);
  })

  const svgWidth = 992, svgHieght = svgWidth*4/5;
  const xMargin = svgWidth/10, yMargin = 15;

  var i = 0;

  var zoom = d3.zoom()
  .scaleExtent([.1, 5])

  var svg = d3.select('#tree-diagram')
  .append('svg')
  .attr('preserveAspectRatio', 'xMidYMid meet')
  .attr('viewBox', '0 0 ' + svgWidth + ', ' + svgHieght + '');

  svg.call(zoom)
  .on("wheel.zoom", null)
  .call(zoom.transform, d3.zoomIdentity.translate(xMargin, yMargin));

  var g = svg.append('g')
  .attr('class', 'sub-tree-diagram')
  .attr('transform', 'translate(' + xMargin + ', ' + yMargin + ')')
  .attr('id', 'element')

  var tree = d3.tree()
  .size([svgWidth - xMargin*2, svgHieght - yMargin*2]);

  var node = d3.hierarchy(data, function(d) {
    return d.children;
  });
  node = tree(node);

  update();

  function click(d) {
    if(d.data.name != 'N/A') {
      $('#tooltip').css('display', 'none');
    }

    json = {
      "parentNode": null,
      "childNode": totalData.nodes[d.depth]
    }

    function searchUpdate(value) {
      initialNode(node);
      searchValue(node);

      function initialNode(d) {
        d.search = 'no';
        try {
          for(var i = 0; i < d.children.length; i++) {
            initialNode(d.children[i]);
          }
        } catch(exception) {
          return;
        }
      }

      function searchValue(d) {
        try {
          var children = d.children;

          for(var i=0; i < children.length; i++) {
            searchValue(children[i]);

            if(children[i].data.name + children[i].data.value + children[i].data.parent + totalData.nodes[children[i].depth - 1] == value) {
              updateSearchData(children[i].parent);
              children[i].search = 'search';
              return;
            };
          }
        } catch(exception) {
          return;
        }
      }

      function updateSearchData(d) {
        if(d != null) {
          d.search = 'search';

          updateSearchData(d.parent);
        } else {
          return;
        }
      }

      setNoValue(node);

      function setNoValue(d) {
        if(d.data.name != 'type' && d.search == undefined && d.depth < index) {
          d.search = 'no';
        }

        try {
          for(var i=0; i < d.children.length; i++) {
            setNoValue(d.children[i]);
          }
        } catch(exception) {
          return;
        }
      }
    }

    var point;

    for(var i = 0; i < nodeArr.length; i++) {
      if(nodeArr[i].value == d.data.name || (nodeArr[i].value == null && i == d.depth)) {
        point = i;
        break;
      }
    }

    if(d.children || d._children) {
      index = d.depth;

      if(index == 0) {
        nodeArr = [];
      } else {
        nodeArr = nodeArr.slice(0, point);
      }

      if(nodeArr.length < 3) {
        $('#save-btn').attr('disabled', 'disabled');
        $('#table-btn').attr('disabled', 'disabled');
      }

      var findndelete = function(data) {
        var dataName = data.name + data.value + data.parent + data.category;

        if(dataName == d.data.name + d.data.value + d.data.parent + totalData.nodes[d.depth - 1]) {
          delete data.children;
          return;
        } else {
          if(data.children != undefined) {
            for(var i=0; i < data.children.length; i++) {
              findndelete(data.children[i]);
            }
          } else {
            return;
          }
        }
      }

      findndelete(data);
      node = d3.hierarchy(data, function(d) {
        return d.children;
      });
      node = tree(node);

      console.log(d);
      searchUpdate(d.parent.data.name + d.parent.data.value + d.parent.data.parent + totalData.nodes[d.parent.depth - 1]);

      update();
    } else {
      searchUpdate(d.data.name + d.data.value + d.data.parent + totalData.nodes[d.depth - 1]);

      nodeArr = [];
      var nodeArrIndex = 0;
      var dataUpdate = function(node) {
        if(node.search == 'search') {
          if(node.children != undefined) {
            for(var i = 0; i < node.children.length; i++) {
              if(node.children[i].search == 'search') {
                if(node.children[i].data.name == 'N/A') {
                  nodeArr[nodeArrIndex] = { 'name': totalData.nodes[node.depth], 'value': null };
                } else {
                  nodeArr[nodeArrIndex] = { 'name': totalData.nodes[node.depth], 'value': node.children[i].data.name };
                }
              }
            }
            nodeArrIndex++;
            for(var i = 0; i < node.children.length; i++) {
              dataUpdate(node.children[i]);
            }
          }
        } else {
          return;
        }
      }

      if(d.depth < 2) {
        if(index > 0) {
          if(d.data.name == 'N/A') {
            parentNode[0] = {
              "name": totalData.nodes[d.depth - 1],
              "value": null
            }
          } else {
            parentNode[0] = {
              "name": totalData.nodes[d.depth - 1],
              "value": d.data.name
            }
          }

          if(parentNode.length == 0) {
            json.parentNode = null;
          } else {
            json.parentNode = parentNode;
          }
        }
      } else {
        dataUpdate(node);

        if(nodeArr.length == 0) {
          json.parentNode = null;
        } else {
          json.parentNode = nodeArr;
        }
      }

      json.semanticFilters = semanticFilters;

      index++;

      var temp = JSON.stringify(json);

      if(d.depth < 11) {
        $.ajax({
          type: 'POST',
          url: '/data',
          // async: false,
          data: {
            data: temp
          },
          beforeSend:function(){
            $('.loading-bg').eq(0).removeClass('display-none');
          },
          complete:function(){
            $('.loading-bg').eq(0).addClass('display-none');
          },
          success: function(returnData) {
            if(nodeArr.length >= 3) {
              $('#save-btn').removeAttr('disabled');
              $('#table-btn').removeAttr('disabled');
            };

            var returnData = returnData;

            var findninsert = function(data) {
              var dataName = data.name + data.value + data.parent + data.category;

              if(dataName == d.data.name + d.data.value + d.data.parent + totalData.nodes[d.depth - 1]) {
                if(data.children == undefined) {
                  data.children = [];
                  $.each(returnData, function(index, result) {
                    if(Object.values(result)[0] == null) {
                      var temp = { 'name': 'N/A' }
                    } else {
                      var parentArr = d.data.name;
                      function parentArrInsert(d) {
                        if(d.parent == null) {
                          return;
                        } else {
                          parentArr += d.parent.data.name;
                          parentArrInsert(d.parent);
                        }
                      }
                      parentArrInsert(d);

                      var temp = {
                        'name': Object.values(result)[0],
                        'value': Object.values(result)[1],
                        'parent': parentArr,
                        'category': totalData.nodes[d.depth]
                      }
                    }
                    data.children[index] = temp;
                  })
                }
                return;
              } else {
                if(data.children != undefined) {
                  for(var i=0; i < data.children.length; i++) {
                    findninsert(data.children[i]);
                  }
                } else {
                  return;
                }
              }
            }

            findninsert(data)

            node = d3.hierarchy(data, function(d) {
              return d.children;
            });
            node = tree(node);

            searchUpdate(d.data.name + d.data.value + d.data.parent + totalData.nodes[d.depth - 1]);

            update();
          }
        })
      } else {
        $('#alert').fadeIn().delay(1000).fadeOut();
      }
    }
    // }
  }

  function update() {
    var maxDepth = node.depth;
    var findMaxDepth = function(d) {
      var children;

      if(d.children == null) {
        children = d._children;
      } else {
        children = d.children;
      }

      if(children != undefined) {
        for(var i=0; i < children.length; i++) {
          if(maxDepth < children[i].depth) {
            maxDepth = children[i].depth;
          }
          findMaxDepth(children[i]);
        }
      }
    }

    findMaxDepth(node);

    /* links */

    var links = g.selectAll('.link')
    .data(node.descendants().slice(1), function(d) { return d.id || (d.id = ++i); })

    var linkEnter = links.enter()
    // g 하나에 path를 다 넣어버리겠다는 뜻
    .insert('path', 'g')
    .attr('id', function(d) {
      var temp = d.data.name;
      temp = temp.replace(' ', '_').replace('/', '') + d.depth;
      return temp;
    })
    .attr('class', function(d) {
      if(d.search == undefined || d.search == null) {
        return 'link';
      } else {
        return d.search + ' link';
      }
    })
    .attr('fill', 'none')
    .attr('stroke', '#d9d9d9')
    .attr('d', function(d) {
      return 'M' + 300*(d.depth - 1) + ',' + d.parent.x
      + 'C' + (300*d.depth + 300*(d.depth - 1)) / 2 + ',' + d.parent.x
      + ' ' + (300*d.depth + 300*(d.depth - 1)) / 2 + ',' + d.x
      + ' ' + 300*d.depth + ',' + d.x;
    })
    .style('opacity', 0)
    .transition()
    .duration(300)
    .style('opacity', 1)

    linkExit = links.exit()
    .remove();

    /* linkText */

    var tempArr = [];
    var linkText = g.selectAll('.linkText')
    .data(node.descendants(), function(d) { return d.id || (d.id = ++i); })

    var linkTextEnter = linkText.enter()
    .append('text')
    .attr('class', 'linkText')
    .attr('text-anchor', 'middle')
    .attr('dy', '-10')
    .style('text-transform', 'capitalize')
    .style('font-size', '21px')
    .style('font-family', 'Lora, serif')
    .style('fill', 'rgba(0, 0, 0, .35)')
    .style('font-weight', '600')
    .style('opacity', 1)
    .append("textPath")
		.attr("xlink:href", function(d) {
      if(d.depth != 0) {
        if(tempArr[d.depth] == undefined) {
          tempArr[d.depth] = 1;

          var temp = d.data.name;
          temp = temp.replace(' ', '_').replace('/', '') + d.depth;
          return '#' + temp;
        }
      }
    })
		.attr("startOffset", "50%")
    .text(function(d) {
      if(d.depth != 0) {
        if(tempArr[d.depth] == 1) {
          tempArr[d.depth] = 2;
          return totalData.nodes[d.depth - 1];
        }
      }
    })

    var linkTextExit = linkText.exit()
    .remove();

    /* nodes */

    var nodes = g.selectAll('.node')
    .data(node.descendants(), function(d) { return d.id || (d.id = ++i); })

    var nodeEnter = nodes.enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) { return 'translate(' + 300*d.depth + ',' + d.x + ')'; })
    .on('click', click)

    nodeEnter.append('circle')
    .attr('r', 7)
    .attr('fill', function(d) {
      // if(d.search == 'no') {
      //   return '#eee';
      // } else {
        return '#fff';
      // }
    })
    .attr('stroke', 'rgb(120, 200, 80)')
    .attr('stroke-width', 2)
    .style('opacity', 0)
    .on('mouseover', function(d) {
      // if(d.search != 'no') {
        handleMouseOver(d);
      // }
    })
    .on('mousemove', function(d) {
      // if(d.search != 'no') {
        handleMouseMove();
      // }
    })
    .on('mouseout', handleMouseOut)
    .transition()
    .duration(300)
    .style('opacity', 1)
    .style('cursor', 'pointer')

    function handleMouseOver(d) {
      $('#tooltip').css('display', 'block');
      $('#tooltip-text').text(d.data.value);
    }
    function handleMouseMove() {
      var x = d3.event.pageX;
      var y = d3.event.pageY;
      $('#tooltip').css({'top': (y + 10) + 'px', 'left': (x + 14) + 'px'})
    }
    function handleMouseOut() {
      $('#tooltip').css('display', 'none');
    }

    nodeEnter.append('text')
    .text(function(d) { return d.data.name })
    .attr('text-anchor', 'middle')
    .attr('y', '-17px')
    .style('font-size', '15px')
    .style('fill', 'black')
    .style('opacity', 0)
    .transition()
    .duration(300)
    .style('opacity', 1)
    .style('cursor', 'pointer')

    var nodeUpdate = nodes.selectAll('circle')
    .attr('fill', '#fff')

    var nodeExit = nodes.exit()
    .remove();
  }

  zoom.on('zoom', function() {
    $('#tooltip').css('display', 'none');

    var t = d3.event.transform;
    g.attr(
      "transform",
      'translate(' + t.x + ', ' + t.y + ') scale(' + t.k + ')'
    )
  })
  .on('end', function() {
    $('#tooltip').css('display', 'block');
    $('#tooltip').offset({ top: -100 })
    $('#tooltip').offset({ left: -100 })
  })

  $('#zoom-in').click(function() {
    zoom.scaleBy(svg.transition().duration(750), 2);
  })
  $('#zoom-out').click(function() {
    zoom.scaleBy(svg.transition().duration(750), .5);
  })

  $('#table-btn').click(function() {
    $('#result-box').fadeIn().promise().done(function() {
      if(tour != undefined) {
        tour.refresh();
        tour.showHint(6);
      }
    });

    $('html, body').animate({
      scrollTop: $("#header-list").offset().top
    }, 400);

    if(nodeArr.length >= 3) {
      var data = {
        "parentNodes": nodeArr,
        "semanticFilters": semanticFilters
      }
      data = JSON.stringify(data);

      $.ajax({
        type: 'POST',
        url: '/data/table',
        // async: false,
        data: {
          data: data
        },
        beforeSend:function(){
          $('.loading-bg').eq(1).removeClass('display-none');
        },
        complete:function(){
          $('.loading-bg').eq(1).addClass('display-none');
        },
        success: function(returnData) {
          var temp = '';
          for(var i = 0; i < returnData.length; i++) {
            temp += `<li class="result-list">
              <div style="color: black !important; cursor: default"><a target="_blank" href="https://www.clinicaltrials.gov/ct2/show/${returnData[i].nct_id.toUpperCase()}">${returnData[i].nct_id}</a></div>
              <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>design</div>
              <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>subject</div>
              <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>variable</div>
              <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>sissue</div>
            </li>`
          }

          $('#result-list').html(temp);

          $('.result-list').css('display', 'none');
          for(var i = 0; i < 10; i++) {
            $('#result-list li').eq(i).css('display', 'block');
          }

          if(returnData.length != 0) {
            $('#pagination').css('display', 'block');

            var obj = $('#pagination').twbsPagination({
              totalPages: Math.ceil(returnData.length/10),
              visiblePages: 5,
              onPageClick: function (event, page) {
                var temp = (page - 1)*10;
                $('.result-list').css('display', 'none');
                for(var i = 0; i < 10; i++) {
                  $('#result-list li').eq(temp + i).css('display', 'block');
                }
              }
            });

            var $pagination = $('#pagination');

            var currentPage = $pagination.twbsPagination('getCurrentPage');
            $pagination.twbsPagination('destroy');
            $pagination.twbsPagination($.extend({}, {
              totalPages: Math.ceil(returnData.length/10),
              visiblePages: 5,
              onPageClick: function (event, page) {
                var temp = (page - 1)*10;
                $('.result-list').css('display', 'none');
                for(var i = 0; i < 10; i++) {
                  $('#result-list li').eq(temp + i).css('display', 'block');
                }
              }
            }, {
              startPage: currentPage,
              totalPages: Math.ceil(returnData.length/10)
            }));
          } else {
            $('#pagination').css('display', 'none');
            $('#result-list').html(`
              <p style="padding: 35px 0 0; text-align: center; font-size: 16px; color: #444">No result!</p>
            `);
          }
        }
      })
    }
  })

  var saveIndex = 1;
  var svg2 = [];
  var data2;
  $('#save-btn').click(function() {
    console.log(nodeArr);
    var parentNodes = JSON.stringify(nodeArr);
    var semanticFilters;
    if(semanticFilters == undefined) {
      semanticFilters = '[]';
    } else {
      semanticFilters = JSON.stringify(semanticFilters);
    }

    var html = `
      <div class="save-card">
        <span class="save-number">${saveIndex}</span>
        <div id="save${saveIndex}" class="save-vis" data='${parentNodes}' data2='${semanticFilters}'></div>
        <span class="close save-close">×</span>
      </div>
    `;

    $('#save-box').append(html);

    const svgWidth2 = 1200, svgHieght2 = 110;
    const xMargin2 = 90, yMargin2 = 55;

    svg2[saveIndex] = d3.select(`#save${saveIndex}`)
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('viewBox', '0 0 ' + svgWidth2 + ', ' + svgHieght2 + '');

    var g2 = svg2[saveIndex].append('g')
    .attr('class', 'save-tree-diagram')
    .attr('transform', 'translate(' + (xMargin2 - 10) + ', ' + (yMargin2 + 5) + ')');

    // temp2 = [{"name":"type","value":"interventional"},{"name":"primary_purpose","value":"Prevention"},{"name":"endpoint_classification","value":"Safety Study"}]

    var temp2 = $(`#save${saveIndex}`).attr('data');
    temp2 = JSON.parse(temp2);

    saveIndex++;

    data2 = {
      "name": "type",
      "children" : []
    }
    var index2 = 0;
    data2set(data2.children);

    function data2set(d) {
      var temp = {};
      if(temp2[index2] != undefined) {
        if(temp2[index2].value == null) {
          temp.name = 'N/A';
        } else {
          temp.name = temp2[index2].value;
        }
        temp.value = temp2[index2].name;
        temp.children = [];
        d.push(temp);
        index2++;

        data2set(d[0].children);
      } else {
        return;
      }
    }

    console.log(data2);

    var tree2 = d3.tree()
    .size([svgHieght2 - yMargin2*2, svgWidth2 - xMargin2*2]);

    var node2 = d3.hierarchy(data2, function(d) {
      return d.children;
    });
    node2 = tree2(node2);

    var links2 = g2.selectAll('.link2')
    .data(node2.descendants().slice(1), function(d) { return d.id || (d.id = ++i); })
    .enter()
    .append('path')
    .attr('class', 'link2')
    .attr('fill', 'none')
    .attr('stroke', '#d9d9d9')
    .attr('d', function(d) {
      return 'M' + d.y + ',' + d.x
      + 'C' + (d.y + d.parent.y) / 2 + ',' + d.x
      + ' ' + (d.y + d.parent.y) / 2 + ',' + d.parent.x
      + ' ' + d.parent.y + ',' + d.parent.x;
    })

    /* nodes */

    var nodes2 = g2.selectAll('.node2')
    .data(node2.descendants(), function(d) { return d.id || (d.id = ++i); })
    .enter()
    .append('g')
    .attr('class', 'node2')
    .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })

    nodes2.append('circle')
    .attr('class', 'circle2')
    .attr('r', 7)
    .attr('fill', function(d) {
      return '#fff';
    })
    .attr('stroke', 'rgb(120, 200, 80)')
    .attr('stroke-width', 2)

    nodes2.append('text')
    .text(function(d) { return d.data.name })
    .attr('text-anchor', 'middle')
    .attr('y', function(d, index) {
      if(index%2 == 0) {
        return '-17px';
      } else {
        return '26px';
      }
    })
    .style('font-size', '15px')
    .style('fill', 'black')
    .style('cursor', 'pointer')
  })

  $(document).on('mouseenter', '.save-card', function() {
    console.log($(this).children('.save-number').attr('class'));
    $(this).children('.save-number').css('color', 'rgb(80, 160, 50)');
    $(this).css('border-color', '#ddd');
  }).on('mouseleave', '.save-card', function() {
    $(this).children('.save-number').css('color', '#aaa');
    $(this).css('border-color', '#eee');
  });

  $(document).on('click', '.save-close', function() {
    $(this).parent().remove();
    $('.save-number').each(function(index) {
      $(this).text(index + 1);
    })
    $('.save-vis').each(function(index) {
      $(this).attr('id', 'save' + index);
    })
    saveIndex--;
    console.log(saveIndex);
  })

  $(document).on('click', '.save-vis', function() {
    $('#result-box').fadeIn().promise().done(function() {
      if(tour != undefined) {
        tour.refresh();
        tour.showHint(7);
      }
    });

    $('html, body').animate({
      scrollTop: $("#header-list").offset().top
    }, 400);

    var temp = JSON.parse($(this).attr('data'));
    var temp2 = JSON.parse($(this).attr('data2'));
    var data = {
      "parentNodes": temp,
      "semanticFilters": temp2
    }
    data = JSON.stringify(data);

    $.ajax({
      type: 'POST',
      url: '/data/table',
      // async: false,
      data: {
        data: data
      },
      beforeSend:function(){
        $('.loading-bg').eq(1).removeClass('display-none');
      },
      complete:function(){
        $('.loading-bg').eq(1).addClass('display-none');
      },
      success: function(returnData) {
        var temp = '';
        for(var i = 0; i < returnData.length; i++) {
          temp += `<li class="result-list">
            <div style="color: black !important; cursor: default"><a target="_blank" href="https://www.clinicaltrials.gov/ct2/show/${returnData[i].nct_id.toUpperCase()}">${returnData[i].nct_id}</a></div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>design</div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>subject</div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>variable</div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>sissue</div>
          </li>`
        }

        $('#result-list').html(temp);

        $('.result-list').css('display', 'none');
        for(var i = 0; i < 10; i++) {
          $('#result-list li').eq(i).css('display', 'block');
        }

        if(returnData.length != 0) {
          $('#pagination').css('display', 'block');

          var obj = $('#pagination').twbsPagination({
            totalPages: Math.ceil(returnData.length/10),
            visiblePages: 5,
            onPageClick: function (event, page) {
              var temp = (page - 1)*10;
              $('.result-list').css('display', 'none');
              for(var i = 0; i < 10; i++) {
                $('#result-list li').eq(temp + i).css('display', 'block');
              }
            }
          });

          var $pagination = $('#pagination');

          var currentPage = $pagination.twbsPagination('getCurrentPage');
          $pagination.twbsPagination('destroy');
          $pagination.twbsPagination($.extend({}, {
            totalPages: Math.ceil(returnData.length/10),
            visiblePages: 5,
            onPageClick: function (event, page) {
              var temp = (page - 1)*10;
              $('.result-list').css('display', 'none');
              for(var i = 0; i < 10; i++) {
                $('#result-list li').eq(temp + i).css('display', 'block');
              }
            }
          }, {
            startPage: currentPage,
            totalPages: Math.ceil(returnData.length/10)
          }));
        } else {
          $('#pagination').css('display', 'none');
          $('#result-list').html(`
            <p style="padding: 35px 0 0; text-align: center; font-size: 16px; color: #444">No result!</p>
          `);
        }
      }
    })
  })

  $(document).on('click', '#filter-btn', function() {
    $('#result-box').fadeIn().promise().done(function() {
      if(tour != undefined) {
        tour.refresh();
        tour.showHint(7);
      }
    });

    $('html, body').animate({
      scrollTop: $("#header-list").offset().top
    }, 400);

    semanticFilters = [];
    $('.filter-tag').each(function(index) {
      var temp = JSON.parse($(this).attr('data'));

      for(var i = 0; i < temp.length; i++) {
        semanticFilters[semanticFiltersIndex] = {
          "typeName": temp[i].typeName,
          "value": temp[i].value
        };
        semanticFiltersIndex++;
      }
    })

    var data = {
      "parentNodes": nodeArr,
      "semanticFilters": semanticFilters
    }
    data = JSON.stringify(data);
    console.log(data);

    $.ajax({
      type: 'POST',
      url: '/data/table',
      // async: false,
      data: {
        data: data
      },
      beforeSend:function(){
        $('.loading-bg').eq(1).removeClass('display-none');
      },
      complete:function(){
        $('.loading-bg').eq(1).addClass('display-none');
      },
      success: function(returnData) {
        var temp = '';
        for(var i = 0; i < returnData.length; i++) {
          temp += `<li class="result-list">
            <div style="color: black !important; cursor: default"><a target="_blank" href="https://www.clinicaltrials.gov/ct2/show/${returnData[i].nct_id.toUpperCase()}">${returnData[i].nct_id}</a></div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>design</div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>subject</div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>variable</div>
            <div class="popup" data-toggle="modal" data-target="#modal-page"><i class="fa fa-external-link"></i>sissue</div>
          </li>`
        }

        $('#result-list').html(temp);

        $('.result-list').css('display', 'none');
        for(var i = 0; i < 10; i++) {
          $('#result-list li').eq(i).css('display', 'block');
        }

        if(returnData.length != 0) {
          $('#pagination').css('display', 'block');

          var obj = $('#pagination').twbsPagination({
            totalPages: Math.ceil(returnData.length/10),
            visiblePages: 5,
            onPageClick: function (event, page) {
              var temp = (page - 1)*10;
              $('.result-list').css('display', 'none');
              for(var i = 0; i < 10; i++) {
                $('#result-list li').eq(temp + i).css('display', 'block');
              }
            }
          });

          var $pagination = $('#pagination');

          var currentPage = $pagination.twbsPagination('getCurrentPage');
          $pagination.twbsPagination('destroy');
          $pagination.twbsPagination($.extend({}, {
            totalPages: Math.ceil(returnData.length/10),
            visiblePages: 5,
            onPageClick: function (event, page) {
              var temp = (page - 1)*10;
              $('.result-list').css('display', 'none');
              for(var i = 0; i < 10; i++) {
                $('#result-list li').eq(temp + i).css('display', 'block');
              }
            }
          }, {
            startPage: currentPage,
            totalPages: Math.ceil(returnData.length/10)
          }));
        } else {
          $('#pagination').css('display', 'none');
          $('#result-list').html(`
            <p style="padding: 35px 0 0; text-align: center; font-size: 16px; color: #444">No result!</p>
          `);
        }
      }
    })
  })
})
