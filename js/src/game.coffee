Game =
  shapes: ["heart", "star", "square", "circle", "rocket", "car"]
  randomShapeClass: ->
    "fa-" + Game.shapes[Math.floor(Math.random()*Game.shapes.length)]
  populateCandyWithRandomShape: (candy) ->
    $(candy).addClass(Game.randomShapeClass).addClass('animated').addClass('infinite')
  populateCellsWithShapes: ->
    $.each $(".cell i"), (i, ele) ->
      Game.populateCandyWithRandomShape(ele)
  popualateCellCoordinates: ->
    rowNo = 1
    colNo = 1
    $.each $("#board .row")
    , (i, row) ->
      colNo = 1
      $.each $(row).children('.cell')
      , (j, cell) ->
        cell.dataset.rowNo = rowNo
        cell.dataset.colNo = colNo
        colNo++
      rowNo++
    Game.rowsCount = rowNo - 1
    Game.columnsCount = colNo - 1
  fetchCell: (rowNo, colNo) ->
    selector = ".cell"
    selector += "[data-row-no='#{rowNo}']"
    selector += "[data-col-no='#{colNo}']"
    $(selector)
  coordinatesOfCell: (cell) ->
    rowNo = parseInt(cell.dataset.rowNo)
    colNo = parseInt(cell.dataset.colNo)
    [rowNo, colNo]
  highlightCell: (cell) ->
    $(cell).children('i').addClass('jello')
  updateScore: ->
    $('#score').html(Game.score)
  incrementScore: (increment) ->
    Game.score += increment
    Game.updateScore()
  handleCellClick: (cell) ->
    if Game.selectedCell == null
      Game.selectCell(cell)
    else
      coords = Game.coordinatesOfCell(cell)
      rowNo = coords[0]
      colNo = coords[1]
      coords = Game.coordinatesOfCell(Game.selectedCell)
      orgRowNo = coords[0]
      orgColNo = coords[1]
      absDiff = [Math.abs(rowNo - orgRowNo), Math.abs(colNo - orgColNo)].sort()
      if absDiff[0] == 0 && absDiff[1] == 1
        Game.swapCells(Game.selectedCell, cell)
        Game.incrementScore(-1)
        Game.checkMatches()
      Game.deselectCell()
  candyInCell: (cell) ->
    $(cell).children('i')
  shapeClassOfCandy: (candy) ->
    candy
    .attr('class')
    .split(" ")
    .find((className) -> className.match(/fa\-/)?)
  swapCells:(c1, c2) ->
    child1 = Game.candyInCell(c1)
    child2 = Game.candyInCell(c2)
    className1 = Game.shapeClassOfCandy(child1)
    className2 = Game.shapeClassOfCandy(child2)
    # Interchange classes
    child1.removeClass(className1).addClass(className2)
    child2.removeClass(className2).addClass(className1)
  selectCell: (cell) ->
    Game.selectedCell = cell
    $(cell).children('i').addClass('flash')
    coords = Game.coordinatesOfCell(cell)
    rowNo = coords[0]
    colNo = coords[1]
    Game.highlightCell(Game.fetchCell(rowNo-1, colNo))
    Game.highlightCell(Game.fetchCell(rowNo+1, colNo))
    Game.highlightCell(Game.fetchCell(rowNo, colNo-1))
    Game.highlightCell(Game.fetchCell(rowNo, colNo+1))
  deselectCell: ->
    $('.cell i').removeClass('jello').removeClass('flash')
    Game.selectedCell = null
  bindCellsForClick: ->
    $('.cell').click ->
      Game.handleCellClick(@)
  removeElement: (rowNo, colNo) ->
    cell = Game.fetchCell(rowNo, colNo)
    candy = Game.candyInCell(cell)
    shapeClass = Game.shapeClassOfCandy(candy)
    candy.removeClass(shapeClass).addClass(Game.dummyShapeClass)
    for i in [rowNo..2]
      Game.swapCells Game.fetchCell(i, colNo), Game.fetchCell(i-1, colNo)
    topCell = Game.fetchCell 1, colNo
    topCandy = Game.candyInCell(topCell)
    topCandy.removeClass Game.dummyShapeClass
    Game.populateCandyWithRandomShape(topCandy)
  removeElements: (rowNo, firstColNo, lastColNo)->
    # Game.removeElement(rowNo, colNo) for colNo in [firstColNo..lastColNo]
    for colNo in [firstColNo..lastColNo]
      Game.removeElement(rowNo, colNo)
  checkMatches: ->
    console.log "Checking matches"
    currentRowNo = Game.rowsCount
    currentColNo = 1
    checkingShape = null
    currentLength = 0

    while currentColNo <= Game.columnsCount
      currentCell = Game.fetchCell(currentRowNo, currentColNo)
      currentCandy = Game.candyInCell(currentCell)
      currentShape = Game.shapeClassOfCandy(currentCandy)
      checkingShape = currentShape unless checkingShape?
      if checkingShape == currentShape
        currentLength++
      else
        if currentLength > 2
          console.log "The length is more: #{currentLength}"
          Game.incrementScore(currentLength + 1)
          Game.removeElements currentRowNo, (currentColNo - currentLength), (currentColNo - 1)
          # Remove the matching elements
          # Bring down the elements above the removed elements
          # Populate blank cell on top with random shapes
          # Break the checking process
        checkingShape = currentShape
        currentLength = 1
      currentColNo++
  init: ->
    Game.dummyShapeClass = 'fa-circle-thin'
    Game.rowsCount = 0
    Game.columnsCount = 0
    Game.score = 0
    Game.updateScore()
    Game.deselectCell()
    Game.populateCellsWithShapes()
    Game.popualateCellCoordinates()
    Game.bindCellsForClick()
    Game.checkMatches()

$ ->
  Game.init()
