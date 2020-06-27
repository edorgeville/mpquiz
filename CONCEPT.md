# MPQuiz
## Mario Party style quiz, with powerups and endgame bullshit

### Features
- Fast paced questions
- Coin reward system
- Redeem coins for a star
- Event questions:
  - Steal a star
  - Steal coins
- [Bowser space](https://www.mariowiki.com/Mario_Party_5#Normal_spaces)
  - Bowser Revolution, divides everyone's coins equally
  - Bowser Minigame, forces everyone to play his minigames,
  - Bowser Shuffle, shuffles coins of all players
  - Bowser Bonus, steals a Star from the player.
- Mini-games in teams!
- Endgame bonus stars!
- First to text the word *supercalifragilisticexpialidocious* to a phone number

### Architecture

#### Database
Storage options should be either:
- Google Sheets; easy to tap into during the game, gives visibility to the users after quiz ends, but latency might be an issue
- Firebase; realtime, might even be connected to directly by the users, sync is ensured

#### Back-end
Node-red will be serving the webpages to players and communicate over a websocket connection.  
When a user connections, they can either create a profile or use an existing one.
Each profile gets a 4 letters UUID (e.g. A B C D); This gives 456,976 possible ids.
Here's a non exhaustive list of necessary flows to implement:
- Master; admin controls for the quiz
- Spreadsheet middleware
- 

#### Front-end
VueJS or React should be used for front-end.
A cookie is stored locally containing the user UUID. This UUID will be sent on websocket first connection so node-red establishes a match between profile and websocket session.
