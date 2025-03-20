let gameState = {
    playerName: "",
    playerChips: 100,
    playerCards: [],
    dealerCards: [],
    playerSum: 0,
    dealerSum: 0,
    betAmount: 0,
    isAlive: false,
    hasBlackJack: false,
    hasStood: false,
    luckyCard: Math.floor(Math.random() * 13) + 1, // Unique Feature: Lucky Card
    winStreak: 0,                // Track current win streak
    highestWinStreak: 0,         // Track highest win streak achieved
    streakMultiplier: 1,         // Multiplier for progressive betting system
};

// Get DOM elements after page loads
document.addEventListener('DOMContentLoaded', function() {
    messageEl = document.getElementById("message-el");
    gameCards = document.getElementById('gameCards');
    startButton = document.getElementById('startButton');
    gameButtons = document.getElementById('gameButtons');
    usernameInput = document.getElementById('name');
    betInput = document.getElementById('bet');
    playerEl = document.getElementById("player-el");
    newGameEl = document.getElementById("newGame");
    streakEl = document.getElementById("streak-el");
});

function getRandomCard() {
    let randomCard = Math.floor(Math.random() * 13) + 1;
    if (randomCard === 1) {
        return 11; // Ace is worth 11
    } else if (randomCard > 10) {
        return 10; // Face cards are worth 10
    } else {
        return randomCard;
    }
}

function startGame(playerName, betAmount) {
    // Input validation
    if (!playerName || playerName.trim() === "") {
        alert("Please enter your name!");
        return;
    }
    
    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount!");
        return;
    }
    
    betAmount = parseInt(betAmount);
    
    if (betAmount > gameState.playerChips) {
        alert("You don't have enough chips for this bet!");
        return;
    }
    
    // Initialize game state
    gameState = {
        ...gameState,
        playerName,
        playerChips: gameState.playerChips - betAmount,
        betAmount,
        isAlive: true,
        hasBlackJack: false,
        hasStood: false,
        playerCards: [getRandomCard(), getRandomCard()],
        dealerCards: [getRandomCard(), getRandomCard()],
    };
    
    // Calculate initial sums
    calculateSums();
    
    // Create game elements
    gameCards.innerHTML = `
        <p id="dealer-el">Dealer's Cards:</p>
        <p id="cards-el">Your Cards:</p>
        <p id="sum-el">Sum: ${gameState.playerSum}</p>
        <p>Lucky Card: ${gameState.luckyCard} (Draw it for a bonus!)</p>
        <p id="streak-el">Current Win Streak: ${gameState.winStreak} (Multiplier: ${gameState.streakMultiplier}x)</p>
    `;

    gameButtons.innerHTML = `
        <button onclick="newCard()">NEW CARD</button>
        <button onclick="stand()">STAND</button>
    `;
    
    // Hide start elements
    document.querySelector('div > input[type="text"]').style.display = 'none';
    document.querySelector('div > input[type="number"]').style.display = 'none';
    startButton.style.display = 'none';
    
    renderGame();
}

function calculateSums() {
    // Calculate player's sum
    gameState.playerSum = 0;
    let aceCount = 0;
    
    for (let i = 0; i < gameState.playerCards.length; i++) {
        if (gameState.playerCards[i] === 11) {
            aceCount++;
        }
        gameState.playerSum += gameState.playerCards[i];
    }
    
    // Handle aces if bust
    while (gameState.playerSum > 21 && aceCount > 0) {
        gameState.playerSum -= 10;
        aceCount--;
    }
    
    // Calculate dealer's sum
    gameState.dealerSum = 0;
    aceCount = 0;
    
    for (let i = 0; i < gameState.dealerCards.length; i++) {
        if (gameState.dealerCards[i] === 11) {
            aceCount++;
        }
        gameState.dealerSum += gameState.dealerCards[i];
    }
    
    // Handle aces if bust
    while (gameState.dealerSum > 21 && aceCount > 0) {
        gameState.dealerSum -= 10;
        aceCount--;
    }
}

function renderGame() {
    // Update dealer cards display
    const dealerCardsEl = document.querySelector("#dealer-el");
    if (dealerCardsEl) {
        dealerCardsEl.textContent = "Dealer's Cards: ";
        for (let i = 0; i < gameState.dealerCards.length; i++) {
            if (!gameState.hasStood && i === 1) {
                dealerCardsEl.textContent += "? ";
            } else {
                dealerCardsEl.textContent += gameState.dealerCards[i] + " ";
            }
        }
        
        if (gameState.hasStood) {
            dealerCardsEl.textContent += `(Sum: ${gameState.dealerSum})`;
        }
    }

    // Update player cards display
    const playerCardsEl = document.querySelector("#cards-el");
    if (playerCardsEl) {
        playerCardsEl.textContent = "Your Cards: " + gameState.playerCards.join(" ");
    }
    
    // Update sum display
    const sumEl = document.querySelector("#sum-el");
    if (sumEl) {
        sumEl.textContent = "Sum: " + gameState.playerSum;
    }
    
    // Update player info
    playerEl.textContent = `${gameState.playerName}: $${gameState.playerChips}`;
    
    // Update streak display
    const streakEl = document.querySelector("#streak-el");
    if (streakEl) {
        streakEl.textContent = `Current Win Streak: ${gameState.winStreak} (Multiplier: ${gameState.streakMultiplier}x)`;
    }
    
    checkGameStatus();
}

function checkGameStatus() {
    if (gameState.playerSum === 21) {
        messageEl.textContent = "Wohoo! You've got Blackjack!";
        gameState.hasBlackJack = true;
        gameState.isAlive = false;
        
        // Apply streak multiplier to winnings
        const winnings = Math.floor(gameState.betAmount * 2.5 * gameState.streakMultiplier);
        gameState.playerChips += winnings;
        
        // Update win streak and multiplier
        updateWinStreak(true);
        
        showPlayAgainButton();
    } else if (gameState.playerSum > 21) {
        messageEl.textContent = "You busted! Better luck next time!";
        gameState.isAlive = false;
        
        // Reset win streak and multiplier on loss
        updateWinStreak(false);
        
        showPlayAgainButton();
    } else if (gameState.hasStood) {
        if (gameState.dealerSum > 21) {
            messageEl.textContent = "Dealer busted! You win!";
            
            // Apply streak multiplier to winnings
            const winnings = Math.floor(gameState.betAmount * 2 * gameState.streakMultiplier);
            gameState.playerChips += winnings;
            
            // Update win streak and multiplier
            updateWinStreak(true);
        } else if (gameState.playerSum > gameState.dealerSum) {
            messageEl.textContent = "You win!";
            
            // Apply streak multiplier to winnings
            const winnings = Math.floor(gameState.betAmount * 2 * gameState.streakMultiplier);
            gameState.playerChips += winnings;
            
            // Update win streak and multiplier
            updateWinStreak(true);
        } else if (gameState.playerSum === gameState.dealerSum) {
            messageEl.textContent = "It's a tie! Push!";
            gameState.playerChips += parseInt(gameState.betAmount);
            
            // Maintain current streak on tie
        } else {
            messageEl.textContent = "Dealer wins!";
            
            // Reset win streak and multiplier on loss
            updateWinStreak(false);
        }
        gameState.isAlive = false;
        showPlayAgainButton();
    } else {
        messageEl.textContent = "Do you want to draw a new card?";
    }
}

function updateWinStreak(isWin) {
    if (isWin) {
        // Increment win streak
        gameState.winStreak++;
        
        // Update highest win streak if needed
        if (gameState.winStreak > gameState.highestWinStreak) {
            gameState.highestWinStreak = gameState.winStreak;
        }
        
        // Update multiplier based on win streak
        if (gameState.winStreak >= 5) {
            gameState.streakMultiplier = 2.0; // 5+ wins: 2x multiplier
        } else if (gameState.winStreak >= 3) {
            gameState.streakMultiplier = 1.5; // 3-4 wins: 1.5x multiplier
        } else if (gameState.winStreak >= 2) {
            gameState.streakMultiplier = 1.2; // 2 wins: 1.2x multiplier
        } else {
            gameState.streakMultiplier = 1.0; // Default multiplier
        }
    } else {
        // Reset streak and multiplier on loss
        gameState.winStreak = 0;
        gameState.streakMultiplier = 1.0;
    }
}

function newCard() {
    if (gameState.isAlive && !gameState.hasBlackJack) {
        const card = getRandomCard();
        gameState.playerCards.push(card);
        
        // Check for lucky card
        if (card === gameState.luckyCard) {
            gameState.playerChips += 10;
            const oldMessage = messageEl.textContent;
            messageEl.textContent = `Lucky Draw! You get +10 chips!`;
            setTimeout(() => {
                messageEl.textContent = oldMessage;
            }, 1500);
        }
        
        calculateSums();
        renderGame();
    }
}

function stand() {
    if (gameState.isAlive && !gameState.hasBlackJack) {
        gameState.hasStood = true;
        
        // Dealer draws cards until 17 or more
        while (gameState.dealerSum < 17) {
            gameState.dealerCards.push(getRandomCard());
            calculateSums();
        }
        
        renderGame();
    }
}

function showPlayAgainButton() {
    // Show streak info along with the play again button
    newGameEl.innerHTML = `
        <div class="result-summary">
            <p>Current streak: ${gameState.winStreak}</p>
            <p>Highest streak: ${gameState.highestWinStreak}</p>
            <p>Current multiplier: ${gameState.streakMultiplier}x</p>
        </div>
        <button onclick="restartGame()">Play Again</button>
    `;
}

function restartGame() {
    if (gameState.playerChips <= 0) {
        alert("Game over! You're out of chips. Refreshing the game...");
        location.reload();
        return;
    }
    
    // Reset but keep player name, chips, and streak data
    gameState = {
        ...gameState,
        playerCards: [],
        dealerCards: [],
        playerSum: 0,
        dealerSum: 0,
        betAmount: 0,
        isAlive: false,
        hasBlackJack: false,
        hasStood: false,
        luckyCard: Math.floor(Math.random() * 13) + 1,
        // Retaining winStreak, highestWinStreak, and streakMultiplier
    };
    
    // Reset display
    messageEl.textContent = "Want to play a round?";
    playerEl.textContent = `${gameState.playerName}: $${gameState.playerChips}`;
    
    // Show input fields and start button again
    document.querySelector('div > input[type="text"]').style.display = 'inline-block';
    document.querySelector('div > input[type="text"]').value = gameState.playerName;
    document.querySelector('div > input[type="text"]').disabled = true;
    document.querySelector('div > input[type="number"]').style.display = 'inline-block';
    document.querySelector('div > input[type="number"]').value = '';
    startButton.style.display = 'inline-block';
    
    // Clear game elements
    gameCards.innerHTML = '';
    gameButtons.innerHTML = '';
    newGameEl.innerHTML = '';
}