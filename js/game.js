var Game;

Game = {
  bindCellsForClick: function() {
    return $('.cell').click(function() {
      return Game.handleCellClick(this);
    });
  },
  candyInCell: function(cell) {
    return $(cell).children('i');
  },
  coordinatesOfCell: function(cell) {
    var colNo, rowNo;
    rowNo = parseInt(cell.dataset.rowNo);
    colNo = parseInt(cell.dataset.colNo);
    return [rowNo, colNo];
  },
  checkMatches: function() {
    var checkingShape, currentCandy, currentCell, currentColNo, currentLength, currentRowNo, currentShape, matchFound;
    Game.matchingInProgress = true;
    currentRowNo = Game.rowsCount;
    matchFound = false;
    while (currentRowNo > 0) {
      currentColNo = 1;
      checkingShape = null;
      currentLength = 0;
      while (currentColNo <= Game.columnsCount) {
        currentCell = Game.fetchCell(currentRowNo, currentColNo);
        currentCandy = Game.candyInCell(currentCell);
        currentShape = Game.shapeClassOfCandy(currentCandy);
        if (checkingShape == null) {
          checkingShape = currentShape;
        }
        if (checkingShape === currentShape) {
          currentLength++;
          if (currentColNo === Game.columnsCount && currentLength > 2) {
            matchFound = true;
            Game.handleMatch(currentRowNo, currentColNo + 1, currentLength);
          }
        } else {
          if (currentLength > 2) {
            matchFound = true;
            Game.handleMatch(currentRowNo, currentColNo, currentLength);
          }
          checkingShape = currentShape;
          currentLength = 1;
        }
        currentColNo++;
      }
      currentRowNo--;
    }
    return setTimeout(function() {
      if (matchFound) {
        return Game.checkMatches();
      } else {
        return Game.matchingInProgress = false;
      }
    }, Game.waitTimes.recheck);
  },
  deselectCell: function() {
    $('.cell i').removeClass('jello').removeClass('flash');
    return Game.selectedCell = null;
  },
  fetchCell: function(rowNo, colNo) {
    var selector;
    selector = ".cell";
    selector += "[data-row-no='" + rowNo + "']";
    selector += "[data-col-no='" + colNo + "']";
    return $(selector);
  },
  handleCellClick: function(cell) {
    var absDiff, colNo, coords, orgColNo, orgRowNo, rowNo;
    if (Game.matchingInProgress) {
      return;
    }
    if (Game.selectedCell === null) {
      return Game.selectCell(cell);
    } else {
      coords = Game.coordinatesOfCell(cell);
      rowNo = coords[0];
      colNo = coords[1];
      coords = Game.coordinatesOfCell(Game.selectedCell);
      orgRowNo = coords[0];
      orgColNo = coords[1];
      absDiff = [Math.abs(rowNo - orgRowNo), Math.abs(colNo - orgColNo)].sort();
      if (absDiff[0] === 0 && absDiff[1] === 1) {
        Game.swapCells(Game.selectedCell, cell);
        Game.incrementScore(-1);
        Game.checkMatches();
      }
      return Game.deselectCell();
    }
  },
  handleMatch: function(rowNo, colNo, length) {
    Game.incrementScore(length + 1);
    return Game.removeElements(rowNo, colNo - length, colNo - 1);
  },
  highlightCell: function(cell) {
    return $(cell).children('i').addClass('jello');
  },
  incrementScore: function(increment) {
    Game.score += increment;
    return Game.updateScore();
  },
  populateCandyWithRandomShape: function(candy) {
    return $(candy).addClass(Game.randomShapeClass).addClass('animated').addClass('infinite');
  },
  popualateCellCoordinates: function() {
    var colNo, rowNo;
    rowNo = 1;
    colNo = 1;
    $.each($("#board .row"), function(i, row) {
      colNo = 1;
      $.each($(row).children('.cell'), function(j, cell) {
        cell.dataset.rowNo = rowNo;
        cell.dataset.colNo = colNo;
        return colNo++;
      });
      return rowNo++;
    });
    Game.rowsCount = rowNo - 1;
    return Game.columnsCount = colNo - 1;
  },
  populateCellsWithShapes: function() {
    return $.each($(".cell i"), function(i, ele) {
      return Game.populateCandyWithRandomShape(ele);
    });
  },
  randomShapeClass: function() {
    return "fa-" + Game.shapes[Math.floor(Math.random() * Game.shapes.length)];
  },
  removeElement: function(rowNo, colNo) {
    var candy, cell, shapeClass;
    cell = Game.fetchCell(rowNo, colNo);
    candy = Game.candyInCell(cell);
    shapeClass = Game.shapeClassOfCandy(candy);
    candy.addClass("shake");
    return setTimeout(function() {
      candy.removeClass("shake");
      candy.addClass("zoomOutDown");
      return setTimeout(function() {
        var i, k, ref, results;
        candy.removeClass("zoomOutDown");
        candy.removeClass(shapeClass);
        Game.populateCandyWithRandomShape(candy);
        results = [];
        for (i = k = ref = rowNo; ref <= 1 ? k <= 1 : k >= 1; i = ref <= 1 ? ++k : --k) {
          if (i > 1) {
            results.push(Game.swapCells(Game.fetchCell(i, colNo), Game.fetchCell(i - 1, colNo)));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }, Game.waitTimes.removeMatch);
    }, Game.waitTimes.highLightMatch);
  },
  removeElements: function(rowNo, firstColNo, lastColNo) {
    var colNo, k, ref, ref1, results;
    results = [];
    for (colNo = k = ref = firstColNo, ref1 = lastColNo; ref <= ref1 ? k <= ref1 : k >= ref1; colNo = ref <= ref1 ? ++k : --k) {
      results.push(Game.removeElement(rowNo, colNo));
    }
    return results;
  },
  selectCell: function(cell) {
    var colNo, coords, rowNo;
    Game.selectedCell = cell;
    $(cell).children('i').addClass('flash');
    coords = Game.coordinatesOfCell(cell);
    rowNo = coords[0];
    colNo = coords[1];
    Game.highlightCell(Game.fetchCell(rowNo - 1, colNo));
    Game.highlightCell(Game.fetchCell(rowNo + 1, colNo));
    Game.highlightCell(Game.fetchCell(rowNo, colNo - 1));
    return Game.highlightCell(Game.fetchCell(rowNo, colNo + 1));
  },
  shapeClassOfCandy: function(candy) {
    return candy.attr('class').split(" ").find(function(className) {
      return className.match(/fa\-/) != null;
    });
  },
  shapes: ["heart", "star", "square", "circle", "rocket", "car"],
  swapCells: function(c1, c2) {
    var child1, child2, className1, className2;
    child1 = Game.candyInCell(c1);
    child2 = Game.candyInCell(c2);
    className1 = Game.shapeClassOfCandy(child1);
    className2 = Game.shapeClassOfCandy(child2);
    child1.removeClass(className1).addClass(className2);
    return child2.removeClass(className2).addClass(className1);
  },
  updateScore: function() {
    return $('#score').html(Game.score);
  },
  waitTimes: {
    buffer: 500,
    highLightMatch: 1500,
    removeMatch: 500,
    recheck: 2500
  },
  init: function() {
    Game.dummyShapeClass = 'fa-circle-thin';
    Game.rowsCount = 0;
    Game.columnsCount = 0;
    Game.score = 0;
    Game.matchingInProgress = false;
    Game.updateScore();
    Game.deselectCell();
    Game.populateCellsWithShapes();
    Game.popualateCellCoordinates();
    Game.bindCellsForClick();
    return Game.checkMatches();
  }
};

$(function() {
  return Game.init();
});
