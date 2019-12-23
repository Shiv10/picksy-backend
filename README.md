<div align="center">
  <h1>CSI-Pictionary</h1>
</div>

<div align="center" style="color: #6f7371">
  <i>Online pictionary game for Codespace 2020</i><br><br>
</div>

<div align="center">

<a href="https://www.atlassian.com/git/tutorials/what-is-git">
    <img src="https://forthebadge.com/images/badges/uses-git.svg" alt="HTML">
</a>

<a href="https://javascript.info/">
    <img src="https://forthebadge.com/images/badges/uses-js.svg" alt="Javascript">
</a>

<a href="https://docs.mongodb.com/">
    <img src="https://forthebadge.com/images/badges/no-ragrets.svg" alt="Javascript">
</a>

<a href="https://github.com/roerohan/incore-session-on-git">
    <img src="https://forthebadge.com/images/badges/built-with-love.svg" alt="Javascript">
</a>

</div>

`CSI-Pictionary` is an online pictionary platform. Here people would e joining rooms (only 1 room for now), and the game would begin by selecting a participant at random, who will be given an option to select a word from set of 3 words. After choosing this, he may start drawing, given 80 secs per drawing. <br><br>
Other participants would be looking at the board on their screen in realtime. They have to guess the word being drawn. Points will be awarded on first right answer basis. <br><br>
This will go on for every participant in the room. After everyone's turn, round 1 will be over. There would be 3 rounds per match.<br><br>
Built using expressJS, socketio and mongoose
## Table of Contents
- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Game Flow](#game-flow)
- [Routes](#routes)
- [JS modules/actions](#js-modulesactions)
- [Contribution](#contribution)
- [Tutorials](#tutorials)
  - [Git](#git)
  - [Node.js](#nodejs)
  - [MongoDB (Mongoose.js Library)](#mongodb-mongoosejs-library)
  - [SocketIO](#socketio)

## [Overview](#overview)
- __Real time drawing board:__ Using web-sockets synced across all the clients in real-time, plotting the same drawing done on the drawer's screen.
- __Chat Box:__ This would be the place where participants would be typing their guesses. To be synced real time. Filter curse words from bag of words. No limit on guesses by the participants.
- __Point system:__ Highest point to the first person to guess, plus the bonus points according to remaining time. Base points to be given compulsarily to everyone. Relative scores for the drawer.
- __User selection:__ Choose the participant randomly at start and then proceed linearly, or some other way; so that everyone gets to be a drawer once in each round.
- __Kick and ban:__ Ability to kick anyone from the room (to avoid misbehavior) by admin. Or option for participants to kick another user, if 5 people vote on kicking a particular participant.
- __Word recommender:__ Choose 3 words at random from bag of words and show it to the drawer. Keep base points for each word, but dont reveal it to the participants.
- __Letter-by-letter Reveal:__ Guessing the whole word might be hard for participants and would make the game boring. So, reveal the letters at random positions, one by one (obviously keeping a max limit for the reveal).
- __Word relevance:__ When the participant guesses the word, add an subtle alert in the chat-box that the guessed word was close to the answer. Could use fuzzy-match algo for this. Suggest if you got some better one

## [Game Flow](#gameflow)
Sr. No |  Description
-------|-----------------------------------------------------
1      |  `x` minutes wait time for people to join the room.
2      |  Commence the game, by selecting a participant at random
3      |  Give the drawer option to choose from 3 words.
4      |  After selection, give him blank drawboard. With colors and other tools to beautify his drawing
5      |  Present to the user the size of words, like _ _ _ _
6      |  As the user draws, update all clients screens.
7      |  Mark the user as done, if he guesses the object.
8      |  Stop the drawing on time limit. Show em the scores
9      |  4 seconds interval, then next participant selected to draw.
10     |  At the end of round1, show em scores. Start round2 after 20 seconds.
11     |  After end of all three rounds(end of match), display the scores and restart the game resetting the socres for that match (0 all)
12     |  Store the scores per match for all the participants in their profile.
13     |  Ability to exit the game in between, won't harm their scores. Thier current score should be added to their account on quitting.


## [Routes](#routes)
> TBD

## [JS modules/actions](#actions)
Files               |   Description
--------------------|------------------------------------------
auth.js             |   Adds user to pictionary game, accountsDB link.
game.js             |   Main Base route to link controllers (no buissness logic here).
drawboard.js        |   Use sockets to sync the drawboard and broadcast it
constants.js        |   Store all game constants here.
languageHandler.js  |   - Select 3 words from bag of words. <br>- Add new words to bag of words. <br>- Fuzzy match the words for closeliness
endGame.js          |   Logic for ending round, match, abrupt quitting and updating profile points.


## Contribution

* Fork the repository, use the dev branch and please create pull requests to contribute to this project.
* Follow the same coding style as used in the project. Pay attention to the usage of tabs, spaces, newlines and brackets. Try to copy the aesthetics as best as you can.
* A linter will be set up for all parts of the project. Code must be written so that there are no errors in linting. Find out what a linter is [here](https://en.wikipedia.org/wiki/Lint_(software)).
* Write [good commit messages](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html), explain what your patch does, and why it is needed.
* Keep it simple: Any patch that changes a lot of code or is difficult to understand should be discussed before you put in the effort.
* All commit messages must have one of the following prefixes:
    * feat: When a new feature is added
    * fix: When a bug is fixed
    * refactor: When the code is refactored

> Note: Specify WIP: `Pull Request Message` if a Merge Request is made, but the branch is still not ready to merge. <br>Example: `feat: remove timeLimit constraint [WIP]`

## Tutorials

### Git

- [Install Git - Windows](https://git-scm.com/download/win)
- [Git and GitHub Crash Course for Beginners](https://www.youtube.com/watch?v=SWYqp7iY_Tc)
- [Git Cheatsheet](https://github.com/roerohan/incore-session-on-git)

### Node.js

- [Installation](https://nodejs.org/en/download/)
- Javascript
    * [Elaborate](https://www.youtube.com/watch?v=qoSksQ4s_hg&list=PL4cUxeGkcC9i9Ae2D9Ee1RvylH38dKuET)
    * [Brief](https://www.youtube.com/watch?v=W6NZfCO5SIk)
    * [DIY Tutorial](https://github.com/roerohan/Miscellaneous/tree/master/JavaScript)
- Node.js
    * [Tutorial](https://www.youtube.com/watch?v=w-7RQ46RgxU&list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp)

### MongoDB (Mongoose.js Library)

- [Installation](mongodb-win32-x86_64-2012plus-4.2.2-signed)
- [Mongoose.js Docs](https://mongoosejs.com/docs/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Video Tutorial](https://www.youtube.com/watch?v=5e1NEdfs4is)

### SocketIO
- [Getting started](https://socket.io/get-started/chat/)
- [Example Project](https://github.com/socketio/chat-example)
- [Documentation](https://socket.io/docs/)
- [API calls (to be used here)](https://socket.io/docs/server-api/)
