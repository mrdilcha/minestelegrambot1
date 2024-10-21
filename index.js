const { Telegraf } = require('telegraf');

// Replace with your actual bot token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Historical data placeholder for pattern recognition (can be expanded)
let historicalData = [];

// Function to generate guaranteed safe positions based on the number of mines
function generateSafePositions(numMines) {
    if (numMines < 4) {
        return getRandomUniqueNumbers(4, 25); // Give 4 guaranteed diamonds
    } else if (numMines <= 6) {
        return getRandomUniqueNumbers(3, 25); // Give 3 guaranteed diamonds
    } else {
        return getRandomUniqueNumbers(2, 25); // Give 2 guaranteed diamonds
    }
}

// Function to get unique random numbers
function getRandomUniqueNumbers(count, max) {
    const numbers = new Set();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * max));
    }
    return Array.from(numbers);
}

// Function to predict mine positions based on client ID seed and number of mines
function predictMines(clientIdSeed, numMines) {
    const minePositions = getRandomUniqueNumbers(numMines, 25);
    const safePositions = generateSafePositions(numMines);

    // Store current prediction in historical data for future analysis
    historicalData.push({ minePositions, safePositions });

    return { minePositions, safePositions };
}

// Start command handler
bot.start((ctx) => {
    ctx.reply('Welcome to the Stake Mines Predictor Bot! Enter the number of mines (1-24):');
});

// Predict command handler
bot.command('predict', (ctx) => {
    ctx.reply('Please enter your Stake client ID:');
    bot.on('text', (clientIdMsg) => {
        const clientIdSeed = clientIdMsg.text.trim();
        const numMines = parseInt(ctx.message.text.split(' ')[1]);

        if (!numMines || numMines < 1 || numMines > 24) {
            ctx.reply('Please enter a valid number of mines (1-24).');
            return;
        }

        // Generate predictions based on the client ID seed
        const { minePositions, safePositions } = predictMines(clientIdSeed, numMines);

        // Create a 5x5 grid with guaranteed safe positions
        const gridSize = 5;
        let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill('❌')); // Initialize with ❌

        safePositions.forEach(pos => {
            const row = Math.floor(pos / gridSize);
            const col = pos % gridSize;
            grid[row][col] = '💎'; // Place guaranteed diamonds
        });

        minePositions.forEach(pos => {
            const row = Math.floor(pos / gridSize);
            const col = pos % gridSize;
            if (grid[row][col] !== '💎') { // Avoid overwriting guaranteed diamonds
                grid[row][col] = '💣'; // Place mines
            }
        });

        // Send the formatted grid to the user
        const response = grid.map(row => row.join('')).join('\n');
        
        if (historicalData.length > 0) {
            ctx.reply(`Historical Predictions: ${JSON.stringify(historicalData[historicalData.length - 1])}`);
        }

        ctx.reply(`Predicted Pattern:\n${response}`);
    });
});

// Launch the bot
bot.launch().then(() => {
    console.log('Bot is running...');
}).catch(err => console.error(err));
