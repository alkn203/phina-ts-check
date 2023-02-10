//@ts-check

// 型定義ファイルを参照
/// <reference path="./node_modules/phina.js.d.ts/globalized/index.d.ts" />

phina.globalize();
// 定数
const SCREEN_WIDTH = 640;            // 画面横サイズ
const SCREEN_HEIGHT = 960;           // 画面縦サイズ
const PIECE_SIZE = SCREEN_WIDTH / 4; // グリッドのサイズ
const PIECE_NUM = 16;                // ピース数
const PIECE_NUM_X = 4;               // 横のピース数
const PIECE_OFFSET = PIECE_SIZE / 2; // オフセット値
// アセット
const ASSETS = {
  // 画像
  image: {
    'pieces': 'assets/pieces.png',
  },
};
// グリッド
const grid = Grid(SCREEN_WIDTH, PIECE_NUM_X);
// ピースグループ
const pieceGroup = DisplayElement();
// メインシーン
phina.define('MainScene', {
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function () {
    // 親クラス初期化
    this.superInit();
    // 背景色
    this.backgroundColor = 'black';
    this.addChild(pieceGroup);
    // ピース配置
    createPiece();
  },
});
// 16番ピース（空白）を取得
function getBlankPiece() {
  /** @type { Piece | null} */
  let result = null;

  pieceGroup.children.some(function(piece) {
    // 16番ピースを結果に格納I
    if (piece.num === 16) {
      result = piece;
      return true;
    }
  });
  return result;
};
// ピースの移動処理
function movePiece(piece) {
  // 空白ピースを得る
  const blank = getBlankPiece();
  // x, yの座標差の絶対値
  const dx = Math.abs(piece.indexPos.x - blank.indexPos.x);
  const dy = Math.abs(piece.indexPos.y - blank.indexPos.y);
  // 隣り合わせの判定
  if ((piece.indexPos.x === blank.indexPos.x && dy === 1) ||
     (piece.indexPos.y === blank.indexPos.y && dx === 1)) {
    // タッチされたピース位置を記憶
    const tPos = Vector2(piece.x, piece.y);
    // ピース移動処理
    piece.tweener
         .to({x:blank.x, y:blank.y}, 100)
         .call(function() {
            blank.setPosition(tPos.x, tPos.y);
            piece.indexPos = coordToIndex(piece.position);
            blank.indexPos = coordToIndex(blank.position);
         })
         .play();
  }
};
// ピース配置関数
function createPiece() {
  PIECE_NUM.times(function(/** @type {number} */ i) {
    // グリッド配置用のインデックス値算出
    const sx = i % PIECE_NUM_X;
    const sy = Math.floor(i / PIECE_NUM_X);
    // 番号
    const num = i + 1;
    // ピース作成
    const piece = Piece(num).addChildTo(pieceGroup);
    // Gridを利用して配置
    piece.x = grid.span(sx) + PIECE_OFFSET;
    piece.y = grid.span(sy) + PIECE_OFFSET;
    // グリッド上のインデックス値
    piece.indexPos = Vector2(sx, sy);
    // タッチを有効にする
    piece.setInteractive(true);
    // タッチされた時の処理
    piece.on('pointend', () => {
      // ピース移動処理
      movePiece(piece);
    });
    // 16番のピースは非表示
    if (num === 16) {
      piece.hide();
    }
  });
};
// 座標値からインデックス値へ変換
function coordToIndex (vec) {
  const x = Math.floor(vec.x / PIECE_SIZE);
  const y = Math.floor(vec.y / PIECE_SIZE);
  return Vector2(x, y);
};
// ピースクラス
/**
 * @typedef {Object} Piece
 * @property {number} num
 * @property {number} frameIndex
 * @property {Vector2} indexPos
 */
phina.define('Piece', {
  // Spriteを継承
  superClass: 'Sprite',
  // コンストラクタ
  init: function (/** @type {number} */ num) {
    // 親クラス初期化
    this.superInit('pieces', PIECE_SIZE, PIECE_SIZE);
    // 数字
    this.num = num;
    // フレーム
    this.frameIndex = this.num - 1;
    // 位置インデックス
    this.indexPos = Vector2.ZERO;
  },
});
// メイン
phina.main(function () {
  const app = GameApp({
    startLabel: 'main',
    // アセット読み込み
    assets: ASSETS,
  });
  app.run();
});
