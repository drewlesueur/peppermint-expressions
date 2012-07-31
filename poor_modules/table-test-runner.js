poorModule("table-test-runner", function () {
  var convertHtmlTableToArray = function (table) {
    table = $(table)
    headers = []
    table.find("thead th").each(function() {
      headers.push($.trim($(this).text()))
    })
    var tbody = table.find("tbody")
    var vspanMap = {}
    var ret = []

    tbody.find("tr").each(function (trIndex, tr) {
      var row = []
      $(tr).find("td").each(function (tdIndex, td) {
        td = $(td);
        var value = $(td).text()
        row.push(value)
      }) 
      ret.push(row)
    })

    tbody.find("tr").each(function (trIndex, tr) {
      var row = ret[trIndex]
      $(tr).find("td").each(function (tdIndex, td) {
        td = $(td);
        rowspan = td.attr("rowspan") - 0
        rowspan0index = rowspan - 1
        if (rowspan0index > 0) {
          for (var i = 1; i <= rowspan0index; i++) {
            newRow = ret[trIndex + i] 
            newRow.splice(tdIndex, 0, row[tdIndex])
          }   
        }
      }) 
    })


    var ret2 = [] 
    for (var i = 0; i < ret.length; i++) { 
      row = ret[i] 
      var row2 = {} 
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j]
        row2[header] = row[j]
        row2[j] = row[j]
      }
      ret2.push(row2)
    }

    return ret2

  }

  var tableTestRunner = function (table, fn) {
    var tableArray = convertHtmlTableToArray(table);
    var testCount = tableArray.length
    var passingTestCount = 0
    for (var i = 0; i < tableArray.length; i++) {
      var row = tableArray[i];
      try {
        json = fn(row[0])
        if (json == row[1]) {
          $("table tbody tr").eq(i).find("td").eq(0).css("background-color", "lightgreen")
          passingTestCount += 1
        } else {
          $("table tbody tr").eq(i).find("td").eq(0).css("background-color", "pink")
          .append("<pre>////" + json + "</pre>")
        }
      } catch (e) {
          //$("table tbody tr").eq(i).find("td").eq(1).css("background-color", "lightred")
          console.log(e)
          throw e
          continue
      }
    }
    console.log(passingTestCount + "/" + testCount + " tests passed")
    document.title  = passingTestCount
  }

  return tableTestRunner
})
