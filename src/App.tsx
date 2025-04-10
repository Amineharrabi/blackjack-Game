import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { PlayCircle, RotateCcw, Plus, HandMetal, Split, Shield } from 'lucide-react';
import { BlackjackGame, Card, SplitHand } from './utils/blackjack';
import { supabase } from './utils/supabase';
import Login from './components/Login';

function App() {
  const [game] = useState(() => new BlackjackGame());
  const [session, setSession] = useState<{ user: { id: string; email: string } } | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const dealerCardsRef = useRef<HTMLDivElement>(null);
  const playerCardsRef = useRef<HTMLDivElement>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [gameState, setGameState] = useState(game);

  // Fetch session and listen for auth state changes
  useEffect(() => {
    
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session ? { user: { id: session.user.id, email: session.user.email || '' } } : null);
      setLoading(false); // Stop loading once session is fetched
    };

    fetchSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ? { user: { id: session.user.id, email: session.user.email || '' } } : null);
    });

    return () => {
      subscription.subscription?.unsubscribe();
    };
  }, []);

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('Login failed: ' + error.message);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };
  const handleSignUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert('Signup failed: ' + error.message);
      } else {
        alert('Signup successful! Please log in.');
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert('Logout failed: ' + error.message);
      }
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Main game logic
  useEffect(() => {
    if (dealerCardsRef.current) {
      gsap.fromTo(
        dealerCardsRef.current.children,
        { y: -100, opacity: 0 },
        { duration: 0.5, y: 0, opacity: 1, stagger: 0.1, ease: 'back.out(1.7)' }
      );
    }
    if (playerCardsRef.current) {
      gsap.fromTo(
        playerCardsRef.current.children,
        { y: -100, opacity: 0 },
        { duration: 0.5, y: 0, opacity: 1, stagger: 0.1, ease: 'back.out(1.7)' }
      );
    }
  }, [gameState.playerHand, gameState.dealerHand]);

  // Show loading spinner while fetching session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 to-green-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  // Show login screen if no session
  if (!session) {
    return <Login onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  const renderCard = (card: Card) => (
    <div
      key={`${card.display}-${card.suit}`}
      className={`inline-flex items-center justify-center w-16 h-24 m-1 bg-white rounded-lg shadow-md 
        ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-gray-900'}`}
    >
      <div className="text-center">
        <div className="text-xl font-bold">{card.display}</div>
        <div className="text-2xl">{card.suit}</div>
      </div>
    </div>
  );

  const renderSplitHand = (hand: SplitHand, index: number) => (
    <div key={index} className="bg-green-700 rounded-xl p-6 shadow-xl mb-4">
      <h2 className="text-xl font-semibold text-white mb-3">Split Hand {index + 1}</h2>
      <div className="min-h-24 flex flex-wrap">
        {hand.cards.map((card, cardIndex) => (
          <div key={cardIndex} className="animate-fade-in">
            {renderCard(card)}
          </div>
        ))}
      </div>
      {hand.status === 'finished' && (
        <p className="text-white mt-2">Result: {hand.result}</p>
      )}
    </div>
  );

  function updateGameState() {
    setGameState((prev) => {
      const newGameState = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      return newGameState;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <HandMetal className="w-10 h-10 mr-3" />
            Blackjack
          </h1>
          <p className="text-xl text-green-100 mb-4">{gameState.message}</p>
          <p className="text-2xl font-bold text-yellow-400">
            Money: ${gameState.playerMoney}
          </p>
          {gameState.hasInsurance && (
            <p className="text-lg text-yellow-200">Insurance Bet: ${gameState.insuranceBet}</p>
          )}
        </div>

        <div className="bg-green-700 rounded-xl p-6 shadow-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Dealer's Hand</h2>
          <div ref={dealerCardsRef} className="min-h-24 flex flex-wrap">
            {gameState.dealerHand.map((card, index) => (
              <div key={index} className="animate-fade-in">
                {renderCard(card)}
              </div>
            ))}
          </div>
        </div>

        {gameState.splitHands.length > 0 ? (
          gameState.splitHands.map((hand, index) => renderSplitHand(hand, index))
        ) : (
          <div className="bg-green-700 rounded-xl p-6 shadow-xl mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">Your Hand</h2>
            <div ref={playerCardsRef} className="min-h-24 flex flex-wrap">
              {gameState.playerHand.map((card, index) => (
                <div key={index} className="animate-fade-in">
                  {renderCard(card)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {gameState.gameStatus === 'waiting' && (
            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => {
                  const value = Math.max(1, parseInt(e.target.value) || 0);
                  setBetAmount(value);
                }}
                className="w-24 px-3 py-2 rounded-lg"
                min="1"
              />
              <button
                onClick={() => {
                  if (betAmount > gameState.playerMoney) {
                    alert('Insufficient funds to place this bet.');
                    return;
                  }
                  gameState.startGame(betAmount);
                  updateGameState();
                }}
                className="flex items-center px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Game
              </button>
            </div>
          )}

          {gameState.gameStatus === 'playing' && (
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  gameState.hit();
                  updateGameState();
                }}
                className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Hit
              </button>
              <button
                onClick={() => {
                  gameState.stand();
                  updateGameState();
                }}
                className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-400 transition-colors"
              >
                <HandMetal className="w-5 h-5 mr-2" />
                Stand
              </button>
              {gameState.canSplit() && (
                <button
                  onClick={() => {
                    gameState.split();
                    updateGameState();
                  }}
                  className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-400 transition-colors"
                >
                  <Split className="w-5 h-5 mr-2" />
                  Split
                </button>
              )}
              {gameState.canInsure() && (
                <button
                  onClick={() => {
                    gameState.insurance();
                    updateGameState();
                  }}
                  className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition-colors"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Insurance
                </button>
              )}
            </div>
          )}

          {gameState.gameStatus === 'finished' && (
            <button
              onClick={() => {
                gameState.startGame(betAmount);
                updateGameState();
              }}
              className="flex items-center px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Play Again
            </button>
          )}

          <button
            onClick={() => {
              gameState.reset();
              updateGameState();
            }}
            className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset Game
          </button>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );


}
export default App;




