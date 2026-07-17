let board = Array.from({ length: 8 }, () => Array(8).fill(null));  // create da board

setupBoard();

let turn = 'white'; // los variables
let game = true;
let selectedSquare = null;

let shownMoves = [];

const images = {};

const imageSources = {
    whiteKing: "images/whiteKing.png",
    whiteQueen: "images/whiteQueen.png",
    whiteRook: "images/whiteRook.png",
    whiteBishop: "images/whiteBishop.png",
    whiteKnight: "images/whiteKnight.png",
    whitePawn: "images/whitePawn.png",

    blackKing: "images/blackKing.png",
    blackQueen: "images/blackQueen.png",
    blackRook: "images/blackRook.png",
    blackBishop: "images/blackBishop.png",
    blackKnight: "images/blackKnight.png",
    blackPawn: "images/blackPawn.png"
};

let loadedImages = 0;
const totalImages = Object.keys(imageSources).length;

for (const name in imageSources) {
    const image = new Image();

    image.onload = function () {
        loadedImages++;

        if (loadedImages === totalImages) {
            gameUpdate();
        }
    };

    image.onerror = function () {
        console.error(`Could not load: ${imageSources[name]}`);
    };

    image.src = imageSources[name];
    images[name] = image;
}

const imageMap = {
    white: {
        king: images.whiteKing,
        queen: images.whiteQueen,
        rook: images.whiteRook,
        bishop: images.whiteBishop,
        knight: images.whiteKnight,
        pawn: images.whitePawn
    },

    black: {
        king: images.blackKing,
        queen: images.blackQueen,
        rook: images.blackRook,
        bishop: images.blackBishop,
        knight: images.blackKnight,
        pawn: images.blackPawn
    }
};


const canvas = document.getElementById("chessboard"); // so you can actually see the board
const ctx = canvas.getContext("2d");
const squareSize = canvas.width / 8;

const lightColor = '#edd6b0'
const darkColor = '#b88762'

const turnText = document.getElementById("turnText");

// draweth

function setupBoard() {
    board = Array.from({ length: 8 }, () => Array(8).fill(null));

    const backRank = [
        "rook",
        "knight",
        "bishop",
        "queen",
        "king",
        "bishop",
        "knight",
        "rook"
    ];

    for (let col = 0; col < 8; col++) {

        board[7][col] = {
            type: backRank[col],
            color: "white",
            hasMoved: false
        };

        board[6][col] = {
            type: "pawn",
            color: "white",
            hasMoved: false
        };

        board[0][col] = {
            type: backRank[col],
            color: "black",
            hasMoved: false
        };

        board[1][col] = {
            type: "pawn",
            color: "black",
            hasMoved: false
        };
    }
}

function resetBoard() {
    setupBoard();

    turn = "white";
    game = true;

    selectedSquare = null;
    shownMoves = [];
    updateTurnText();
    gameUpdate();
}

function drawBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let lightSquare;
            if ((i+j)%2 === 0) {
                lightSquare = true;
            }
            else {
                lightSquare = false;
            }
            ctx.fillStyle = lightSquare
            ? "#f0d9b5"
            : "#b58863";
            ctx.fillRect(
                j * squareSize,
                i * squareSize,
                squareSize,
                squareSize
            );
        }
    }
}

function drawSelectedSquare() {
    if (selectedSquare === null) {
        return;
    }
    const { row, col } = selectedSquare;
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.fillRect(
        col * squareSize,
        row * squareSize,
        squareSize,
        squareSize
    );
}

function isInsideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isEmpty(board, row, col) {
    return board[row][col] === null;
}

function isEnemy(board, row, col, color) {
    const targetPiece = board[row][col];

    return (
        targetPiece !== null &&
        targetPiece.color !== color &&
        targetPiece.type !== "king"
    );
}

function getPawnMoves(board, row, col) {
  const piece = board[row][col];
  const moves = [];
  const direction = piece.color === "white" ? -1 : 1;
  const startingRow = piece.color === "white" ? 6 : 1;
  const oneForwardRow = row + direction;

  if (
    isInsideBoard(oneForwardRow, col) &&
    isEmpty(board, oneForwardRow, col)
  ) {
    moves.push({
      row: oneForwardRow,
      col
    });
    const twoForwardRow = row + direction * 2;
    if (
      row === startingRow &&
      isInsideBoard(twoForwardRow, col) &&
      isEmpty(board, twoForwardRow, col)
    ) {
      moves.push({
        row: twoForwardRow,
        col
      });
    }
  }

  const leftCaptureCol = col - 1;

  if (
    isInsideBoard(oneForwardRow, leftCaptureCol) &&
    isEnemy(board, oneForwardRow, leftCaptureCol, piece.color)
  ) {
    moves.push({
      row: oneForwardRow,
      col: leftCaptureCol
    });
  }

  const rightCaptureCol = col + 1;

  if (
    isInsideBoard(oneForwardRow, rightCaptureCol) &&
    isEnemy(board, oneForwardRow, rightCaptureCol, piece.color)
  ) {
    moves.push({
      row: oneForwardRow,
      col: rightCaptureCol
    });
  }

  return moves;
}

function getKnightMoves(board, row, col) {
  const piece = board[row][col];
  const moves = [];

  const offsets = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1]
  ];

  for (const [rowOffset, colOffset] of offsets) {
    const targetRow = row + rowOffset;
    const targetCol = col + colOffset;

    if (!isInsideBoard(targetRow, targetCol)) {
      continue;
    }

    const targetPiece = board[targetRow][targetCol];

    if (
    targetPiece === null ||
    (
        targetPiece.color !== piece.color &&
        targetPiece.type !== "king"
    )
) {
      moves.push({
        row: targetRow,
        col: targetCol
      });
    }
  }

  return moves;
}

function getSlidingMoves(board, row, col, directions) {
  const piece = board[row][col];
  const moves = [];

  for (const [rowDirection, colDirection] of directions) {
    let targetRow = row + rowDirection;
    let targetCol = col + colDirection;

    while (isInsideBoard(targetRow, targetCol)) {
      const targetPiece = board[targetRow][targetCol];

      if (targetPiece === null) {
        moves.push({
          row: targetRow,
          col: targetCol
        });
      } else {
        if (
    targetPiece.color !== piece.color &&
    targetPiece.type !== "king"
) {
    moves.push({
        row: targetRow,
        col: targetCol
    });
}

        // Any piece blocks further movement in this direction
        break;
      }

      targetRow += rowDirection;
      targetCol += colDirection;
    }
  }

  return moves;
}

function getRookMoves(board, row, col) {
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1]   // right
  ];

  return getSlidingMoves(board, row, col, directions);
}

function getBishopMoves(board, row, col) {
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
  ];

  return getSlidingMoves(board, row, col, directions);
}

function getQueenMoves(board, row, col) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
  ];

  return getSlidingMoves(board, row, col, directions);
}

function canCastle(board, color, side) {
    const row = color === "white" ? 7 : 0;

    const king = board[row][4];

    if (
        king === null ||
        king.type !== "king" ||
        king.color !== color ||
        king.hasMoved
    ) {
        return false;
    }

    if (side === "kingSide") {
        const rook = board[row][7];

        if (
            rook === null ||
            rook.type !== "rook" ||
            rook.color !== color ||
            rook.hasMoved
        ) {
            return false;
        }

        const enemyColor =
        color === "white" ? "black" : "white";

        return (
            board[row][5] === null &&
            board[row][6] === null &&
            !isSquareAttacked(board, row, 4, enemyColor) &&
            !isSquareAttacked(board, row, 5, enemyColor) &&
            !isSquareAttacked(board, row, 6, enemyColor)
        );
    }

    if (side === "queenSide") {
        const rook = board[row][0];

        if (
            rook === null ||
            rook.type !== "rook" ||
            rook.color !== color ||
            rook.hasMoved
        ) {
            return false;
        }

        return (
            board[row][1] === null &&
            board[row][2] === null &&
            board[row][3] === null &&
            !isSquareAttacked(board, row, 4, enemyColor) &&
            !isSquareAttacked(board, row, 3, enemyColor) &&
            !isSquareAttacked(board, row, 2, enemyColor)
        );
    }

    return false;
}

function getKingMoves(board, row, col) {
    const piece = board[row][col];
    const moves = [];

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ];

    for (const [rowDirection, colDirection] of directions) {
        const targetRow = row + rowDirection;
        const targetCol = col + colDirection;

        if (!isInsideBoard(targetRow, targetCol)) {
            continue;
        }

        const targetPiece = board[targetRow][targetCol];

        if (
    targetPiece === null ||
    (
        targetPiece.color !== piece.color &&
        targetPiece.type !== "king"
    )
){
            moves.push({
                row: targetRow,
                col: targetCol
            });
        }
    }

    if (canCastle(board, piece.color, "kingSide")) {
        moves.push({
            row,
            col: 6,
            special: "castleKingSide"
        });
    }

    if (canCastle(board, piece.color, "queenSide")) {
        moves.push({
            row,
            col: 2,
            special: "castleQueenSide"
        });
    }

    return moves;
}

function getPseudoLegalMoves(board, row, col) {
  if (!isInsideBoard(row, col)) {
    return [];
  }

  const piece = board[row][col];

  if (piece === null) {
    return [];
  }

  switch (piece.type) {
    case "pawn":
      return getPawnMoves(board, row, col);

    case "knight":
      return getKnightMoves(board, row, col);

    case "bishop":
      return getBishopMoves(board, row, col);

    case "rook":
      return getRookMoves(board, row, col);

    case "queen":
      return getQueenMoves(board, row, col);

    case "king":
      return getKingMoves(board, row, col);

    default:
      console.warn(`Unknown piece type: ${piece.type}`);
      return [];
  }
}

function drawShownMoves() {
    for (const move of shownMoves) {
        const centerX =
            move.col * squareSize + squareSize / 2;

        const centerY =
            move.row * squareSize + squareSize / 2;

        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            squareSize * 0.12,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

function drawPieces() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let piece = board[j][i];
            if (piece===null) {
                continue;
            }

            let image = imageMap[piece.color][piece.type];

            ctx.drawImage(
                image,
                i * squareSize,
                j * squareSize,
                squareSize,
                squareSize
            );
        }
    }
}

function isShownMove(row, col) {
    return shownMoves.some(move =>
        move.row === row &&
        move.col === col
    );
}

function findShownMove(row, col) {
    return shownMoves.find(move =>
        move.row === row &&
        move.col === col
    );
}

function handlePromotion(row, col) {
    const piece = board[row][col];

    if (
        piece === null ||
        piece.type !== "pawn" ||
        (row !== 0 && row !== 7)
    ) {
        return;
    }

    let choice = prompt(
        "Promote to queen, rook, bishop, or knight:",
        "queen"
    );

    choice = choice?.toLowerCase();

    const allowedPieces = [
        "queen",
        "rook",
        "bishop",
        "knight"
    ];

    if (!allowedPieces.includes(choice)) {
        choice = "queen";
    }

    piece.type = choice;
}

function movePiece(fromRow, fromCol, toRow, toCol, move = {}) {
    const piece = board[fromRow][fromCol];

    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    piece.hasMoved = true;

    if (move.special === "castleKingSide") {
        const rook = board[fromRow][7];

        board[fromRow][5] = rook;
        board[fromRow][7] = null;

        rook.hasMoved = true;
    }

    if (move.special === "castleQueenSide") {
        const rook = board[fromRow][0];

        board[fromRow][3] = rook;
        board[fromRow][0] = null;

        rook.hasMoved = true;
    }

    handlePromotion(toRow, toCol);
}

function findKing(board, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (
                piece !== null &&
                piece.type === "king" &&
                piece.color === color
            ) {
                return { row, col };
            }
        }
    }

    return null;
}

function attacksAlongDirections(
    board,
    startRow,
    startCol,
    targetRow,
    targetCol,
    directions
) {
    for (const [rowDirection, colDirection] of directions) {
        let row = startRow + rowDirection;
        let col = startCol + colDirection;

        while (isInsideBoard(row, col)) {
            if (row === targetRow && col === targetCol) {
                return true;
            }

            if (board[row][col] !== null) {
                break;
            }

            row += rowDirection;
            col += colDirection;
        }
    }

    return false;
}

function isSquareAttacked(board, targetRow, targetCol, attackingColor) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (
                piece === null ||
                piece.color !== attackingColor
            ) {
                continue;
            }

            // Pawn attacks
            if (piece.type === "pawn") {
                const direction =
                    piece.color === "white" ? -1 : 1;

                const attackRow = row + direction;

                if (
                    attackRow === targetRow &&
                    (
                        col - 1 === targetCol ||
                        col + 1 === targetCol
                    )
                ) {
                    return true;
                }
            }

            // Knight attacks
            else if (piece.type === "knight") {
                const offsets = [
                    [-2, -1],
                    [-2, 1],
                    [-1, -2],
                    [-1, 2],
                    [1, -2],
                    [1, 2],
                    [2, -1],
                    [2, 1]
                ];

                for (const [rowOffset, colOffset] of offsets) {
                    if (
                        row + rowOffset === targetRow &&
                        col + colOffset === targetCol
                    ) {
                        return true;
                    }
                }
            }

            // King attacks
            else if (piece.type === "king") {
                const rowDistance = Math.abs(row - targetRow);
                const colDistance = Math.abs(col - targetCol);

                if (
                    rowDistance <= 1 &&
                    colDistance <= 1 &&
                    (rowDistance !== 0 || colDistance !== 0)
                ) {
                    return true;
                }
            }

            // Rook and queen straight-line attacks
            else if (
                piece.type === "rook" ||
                piece.type === "queen"
            ) {
                if (
                    attacksAlongDirections(
                        board,
                        row,
                        col,
                        targetRow,
                        targetCol,
                        [
                            [-1, 0],
                            [1, 0],
                            [0, -1],
                            [0, 1]
                        ]
                    )
                ) {
                    return true;
                }
            }

            // Bishop and queen diagonal attacks
            if (
                piece.type === "bishop" ||
                piece.type === "queen"
            ) {
                if (
                    attacksAlongDirections(
                        board,
                        row,
                        col,
                        targetRow,
                        targetCol,
                        [
                            [-1, -1],
                            [-1, 1],
                            [1, -1],
                            [1, 1]
                        ]
                    )
                ) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isKingInCheck(board, color) {
    const kingPosition = findKing(board, color);

    if (kingPosition === null) {
        console.error(`Could not find the ${color} king.`);
        return false;
    }

    const enemyColor =
        color === "white" ? "black" : "white";

    return isSquareAttacked(
        board,
        kingPosition.row,
        kingPosition.col,
        enemyColor
    );
}

function drawCheckedKing() {
    for (const color of ["white", "black"]) {
        if (!isKingInCheck(board, color)) {
            continue;
        }

        const king = findKing(board, color);

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

        ctx.fillRect(
            king.col * squareSize,
            king.row * squareSize,
            squareSize,
            squareSize
        );
    }
}

function copyBoard(board) {
    return board.map(row =>
        row.map(piece =>
            piece === null ? null : { ...piece }
        )
    );
}

function makeMoveOnBoard(
    testBoard,
    fromRow,
    fromCol,
    toRow,
    toCol,
    move = {}
) {
    const piece = testBoard[fromRow][fromCol];

    testBoard[toRow][toCol] = piece;
    testBoard[fromRow][fromCol] = null;

    if (move.special === "castleKingSide") {
        const rook = testBoard[fromRow][7];

        testBoard[fromRow][5] = rook;
        testBoard[fromRow][7] = null;
    }

    if (move.special === "castleQueenSide") {
        const rook = testBoard[fromRow][0];

        testBoard[fromRow][3] = rook;
        testBoard[fromRow][0] = null;
    }
}

function getLegalMoves(board, row, col) {
    const piece = board[row][col];

    if (piece === null) {
        return [];
    }

    const pseudoMoves = getPseudoLegalMoves(
        board,
        row,
        col
    );

    return pseudoMoves.filter(move => {
        const testBoard = copyBoard(board);

        makeMoveOnBoard(
            testBoard,
            row,
            col,
            move.row,
            move.col,
            move
        );

        return !isKingInCheck(
            testBoard,
            piece.color
        );
    });
}

function hasAnyLegalMoves(board, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (
                piece !== null &&
                piece.color === color
            ) {
                const legalMoves = getLegalMoves(
                    board,
                    row,
                    col
                );

                if (legalMoves.length > 0) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isCheckmate(board, color) {
    return (
        isKingInCheck(board, color) &&
        !hasAnyLegalMoves(board, color)
    );
}

function isStalemate(board, color) {
    return (
        !isKingInCheck(board, color) &&
        !hasAnyLegalMoves(board, color)
    );
}

function updateTurnText() {
    if (isCheckmate(board, turn)) {
        const winner =
            turn === "white" ? "Black" : "White";

        turnText.textContent =
            `${winner} wins by checkmate`;

        game = false;
        return;
    }

    if (isStalemate(board, turn)) {
        turnText.textContent =
            "Draw by stalemate";

        game = false;
        return;
    }

    turnText.textContent =
        turn === "white"
            ? "White to move"
            : "Black to move";
}

function loadFEN(fen) {
    const parts = fen.trim().split(/\s+/);

    if (parts.length < 2) {
        console.error("Invalid FEN.");
        return false;
    }

    const positionPart = parts[0];
    const activeColor = parts[1];
    const castlingRights = parts[2] ?? "-";

    const rows = positionPart.split("/");

    if (rows.length !== 8) {
        console.error("Invalid FEN: must contain 8 rows.");
        return false;
    }

    const newBoard = Array.from(
        { length: 8 },
        () => Array(8).fill(null)
    );

    const pieceTypes = {
        p: "pawn",
        n: "knight",
        b: "bishop",
        r: "rook",
        q: "queen",
        k: "king"
    };

    for (let row = 0; row < 8; row++) {
        let col = 0;

        for (const character of rows[row]) {
            if (character >= "1" && character <= "8") {
                col += Number(character);
                continue;
            }

            const lowercase = character.toLowerCase();
            const type = pieceTypes[lowercase];

            if (!type || col >= 8) {
                console.error("Invalid FEN piece placement.");
                return false;
            }

            const color =
                character === character.toUpperCase()
                    ? "white"
                    : "black";

            newBoard[row][col] = {
                type,
                color,
                hasMoved: true
            };

            col++;
        }

        if (col !== 8) {
            console.error(`Invalid FEN row ${row + 1}.`);
            return false;
        }
    }

    board = newBoard;

    turn = activeColor === "b"
        ? "black"
        : "white";

    applyFenCastlingRights(castlingRights);

    selectedSquare = null;
    shownMoves = [];
    game = true;

    updateTurnText();
    gameUpdate();

    return true;
}

function applyFenCastlingRights(castlingRights) {
    const whiteKing = board[7][4];
    const blackKing = board[0][4];

    if (
        whiteKing !== null &&
        whiteKing.type === "king" &&
        whiteKing.color === "white"
    ) {
        whiteKing.hasMoved =
            !castlingRights.includes("K") &&
            !castlingRights.includes("Q");
    }

    if (
        blackKing !== null &&
        blackKing.type === "king" &&
        blackKing.color === "black"
    ) {
        blackKing.hasMoved =
            !castlingRights.includes("k") &&
            !castlingRights.includes("q");
    }

    setFenRookMovement(
        7,
        7,
        "white",
        castlingRights.includes("K")
    );

    setFenRookMovement(
        7,
        0,
        "white",
        castlingRights.includes("Q")
    );

    setFenRookMovement(
        0,
        7,
        "black",
        castlingRights.includes("k")
    );

    setFenRookMovement(
        0,
        0,
        "black",
        castlingRights.includes("q")
    );
}

function setFenRookMovement(
    row,
    col,
    color,
    mayCastle
) {
    const rook = board[row][col];

    if (
        rook !== null &&
        rook.type === "rook" &&
        rook.color === color
    ) {
        rook.hasMoved = !mayCastle;
    }
}

function gameUpdate() {
    drawBoard();
    drawCheckedKing();
    drawSelectedSquare();
    drawPieces();
    drawShownMoves();
}

canvas.addEventListener("click", event => {
    if (!game) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX =
        (event.clientX - rect.left) * scaleX;
    const mouseY =
        (event.clientY - rect.top) * scaleY;
    const col = Math.floor(mouseX / squareSize);
    const row = Math.floor(mouseY / squareSize);
    const clickedPiece = board[row][col];

    // try to move the currently selected piece
    const chosenMove = findShownMove(row, col);

    if (
        selectedSquare !== null &&
        chosenMove !== undefined
    ) {
        movePiece(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col,
            chosenMove
        );

        selectedSquare = null;
        shownMoves = [];

        turn = turn === "white"
            ? "black"
            : "white";

        if (isKingInCheck(board, turn)) {
            console.log(`${turn} is in check!`);
        }

        gameUpdate();
        updateTurnText();
        return;
    }

    // select a piece belonging to the current player
    if (
        clickedPiece !== null &&
        clickedPiece.color === turn
    ) {
        selectedSquare = { row, col };

        shownMoves = getLegalMoves(
            board,
            row,
            col
        );
    } else {
        selectedSquare = null;
        shownMoves = [];
    }

    gameUpdate();
});

document
    .getElementById("resetBtn")
    .addEventListener("click", resetBoard);

const fenInput = document.getElementById("fenInput");
const loadFenBtn = document.getElementById("loadFenBtn");

loadFenBtn.addEventListener("click", () => {
    const fen = fenInput.value;

    if (loadFEN(fen)) {
        console.log("FEN loaded successfully.");
    } else {
        alert("That FEN is invalid.");
    }
});

gameUpdate();
updateTurnText();
