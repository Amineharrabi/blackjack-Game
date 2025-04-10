export type Card = {
  value: number;
  display: string;
  suit: string;
};

export type SplitHand = {
  cards: Card[];
  bet: number;
  status: 'playing' | 'finished';
  result: string;
};

export const SUITS = ['♠', '♥', '♦', '♣'];
export const CARD_VALUES = [
  { value: 11, display: 'A' },
  { value: 2, display: '2' },
  { value: 3, display: '3' },
  { value: 4, display: '4' },
  { value: 5, display: '5' },
  { value: 6, display: '6' },
  { value: 7, display: '7' },
  { value: 8, display: '8' },
  { value: 9, display: '9' },
  { value: 10, display: '10' },
  { value: 10, display: 'J' },
  { value: 10, display: 'Q' },
  { value: 10, display: 'K' },
];

export class BlackjackGame {
  private deck: Card[] = [];
  public playerHand: Card[] = [];
  public dealerHand: Card[] = [];
  public splitHands: SplitHand[] = [];
  public currentSplitHand: number = -1;
  public gameStatus: 'waiting' | 'playing' | 'dealer' | 'finished' = 'waiting';
  public message: string = 'Want to play a round?';
  public playerMoney: number = 500;
  public currentBet: number = 0;
  public insuranceBet: number = 0;
  public hasInsurance: boolean = false;

  constructor() {
    this.initializeDeck();
  }

  // Initialize and shuffle the deck
  private initializeDeck() {
    this.deck = SUITS.flatMap(suit =>
      CARD_VALUES.map(cardValue => ({
        value: cardValue.value,
        display: cardValue.display,
        suit,
      }))
    );
    this.shuffleDeck();
  }

  private shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private drawCard(): Card {
    if (this.deck.length === 0) {
      this.initializeDeck();
    }
    return this.deck.pop()!;
  }

  // Check if the player can split their hand
  public canSplit(): boolean {
    return (
      this.playerHand.length === 2 &&
      this.playerHand[0].display === this.playerHand[1].display &&
      this.playerMoney >= this.currentBet &&
      this.splitHands.length < 3 // Maximum 4 hands total
    );
  }

  // Check if the player can place an insurance bet
  public canInsure(): boolean {
    return (
      this.dealerHand.length === 1 &&
      this.dealerHand[0].display === 'A' &&
      !this.hasInsurance &&
      this.playerMoney >= this.currentBet / 2
    );
  }

  // Start a new game
  public startGame(bet: number = 100): boolean {
    if (this.playerMoney < bet) {
      this.message = 'Not enough money to place bet!';
      return false;
    }

    this.resetHands();
    this.currentBet = bet;
    this.playerMoney -= bet;
    this.playerHand = [this.drawCard(), this.drawCard()];
    this.dealerHand = [this.drawCard()];
    this.gameStatus = 'playing';
    this.message = 'Hit or Stand?';

    if (this.canInsure()) {
      this.message = 'Insurance available! Dealer showing Ace';
    }

    return true;
  }

  // Split the player's hand into two hands
  public split() {
    if (!this.canSplit()) return;

    this.splitHands.push(
      { cards: [this.playerHand[0], this.drawCard()], bet: this.currentBet, status: 'playing', result: '' },
      { cards: [this.playerHand[1], this.drawCard()], bet: this.currentBet, status: 'playing', result: '' }
    );

    this.playerMoney -= this.currentBet;
    this.playerHand = [];
    this.currentSplitHand = 0;
    this.message = `Playing split hand 1`;
  }

  // Place an insurance bet
  public insurance() {
    if (!this.canInsure()) return;

    this.insuranceBet = this.currentBet / 2;
    this.playerMoney -= this.insuranceBet;
    this.hasInsurance = true;
    this.message = 'Insurance placed! Continue playing';
  }

  // Player hits (draws a card)
  public hit() {
    if (this.gameStatus !== 'playing') return;

    const hand = this.currentSplitHand >= 0 ? this.splitHands[this.currentSplitHand].cards : this.playerHand;
    hand.push(this.drawCard());

    const total = this.calculateHand(hand);
    if (total > 21) {
      this.handleBust();
    } else if (total === 21) {
      this.stand();
    }
  }

  // Player stands (ends their turn)
  public stand() {
    if (this.gameStatus !== 'playing') return;

    if (this.currentSplitHand >= 0) {
      this.splitHands[this.currentSplitHand].status = 'finished';
      this.nextSplitHand();
    } else {
      this.playDealerTurn();
    }
  }

  // Calculate the total value of a hand
  public calculateHand(hand: Card[]): number {
    let total = hand.reduce((sum, card) => sum + card.value, 0);
    let aces = hand.filter(card => card.value === 11).length;

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  // Reset the game state
  public reset() {
    this.playerMoney = 500;
    this.resetHands();
    this.message = 'Want to play a round?';
    this.initializeDeck();
  }

  private resetHands() {
    this.playerHand = [];
    this.dealerHand = [];
    this.splitHands = [];
    this.currentSplitHand = -1;
    this.currentBet = 0;
    this.insuranceBet = 0;
    this.hasInsurance = false;
    this.gameStatus = 'waiting';
  }

  private handleBust() {
    if (this.currentSplitHand >= 0) {
      const hand = this.splitHands[this.currentSplitHand];
      hand.status = 'finished';
      hand.result = 'Bust!';
      this.nextSplitHand();
    } else {
      this.gameStatus = 'finished';
      this.message = 'Bust! You lose!';
      this.playerMoney -= this.insuranceBet;
    }
  }

  private nextSplitHand() {
    this.currentSplitHand++;
    if (this.currentSplitHand >= this.splitHands.length) {
      this.playDealerTurn();
    } else {
      this.message = `Playing split hand ${this.currentSplitHand + 1}`;
    }
  }

  private playDealerTurn() {
    this.gameStatus = 'dealer';
    while (this.calculateHand(this.dealerHand) < 17) {
      this.dealerHand.push(this.drawCard());
    }

    this.resolveGame();
  }

  private resolveGame() {
    const dealerTotal = this.calculateHand(this.dealerHand);
    const dealerHasBlackjack = dealerTotal === 21 && this.dealerHand.length === 2;

    if (dealerHasBlackjack && this.hasInsurance) {
      this.playerMoney += this.insuranceBet * 3; // 2:1 payout on insurance
    }

    if (this.splitHands.length > 0) {
      this.resolveSplitHands(dealerTotal);
    } else {
      this.resolveRegularHand(dealerTotal, dealerHasBlackjack);
    }

    this.gameStatus = 'finished';
  }

  private resolveSplitHands(dealerTotal: number) {
    this.splitHands.forEach(hand => {
      const handTotal = this.calculateHand(hand.cards);
      if (handTotal <= 21) {
        if (dealerTotal > 21 || handTotal > dealerTotal) {
          hand.result = 'Win!';
          this.playerMoney += hand.bet * 2;
        } else if (handTotal < dealerTotal) {
          hand.result = 'Lose';
        } else {
          hand.result = 'Push';
          this.playerMoney += hand.bet;
        }
      }
    });
    this.message = 'Split hands finished!';
  }

  private resolveRegularHand(dealerTotal: number, dealerHasBlackjack: boolean) {
    const playerTotal = this.calculateHand(this.playerHand);
    const playerHasBlackjack = playerTotal === 21 && this.playerHand.length === 2;

    if (playerHasBlackjack && !dealerHasBlackjack) {
      this.message = 'Blackjack! You win!';
      this.playerMoney += this.currentBet * 2.5; // 3:2 payout for blackjack
    } else if (dealerHasBlackjack && !playerHasBlackjack) {
      this.message = 'Dealer has Blackjack! You lose!';
    } else if (dealerTotal > 21) {
      this.message = 'Dealer busts! You win!';
      this.playerMoney += this.currentBet * 2;
    } else if (dealerTotal > playerTotal) {
      this.message = 'Dealer wins!';
    } else if (playerTotal > dealerTotal) {
      this.message = 'You win!';
      this.playerMoney += this.currentBet * 2;
    } else {
      this.message = 'Push!';
      this.playerMoney += this.currentBet;
    }
  }
}