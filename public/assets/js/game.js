// fetches current users email for submitting scores
let userEmail = sessionStorage.getItem("email")

// declaring variables that are used later
let game, scores = [];

// global game options
let gameOptions = {
 
    // platform speed range, in pixels per second
    platformSpeedRange: [300, 300],
 
    // mountain speed, in pixels per second
    mountainSpeed: 80,
 
    // spawn range, how far should be the rightmost platform from the right edge
    // before next platform spawns, in pixels
    spawnRange: [80, 300],
 
    // platform width range, in pixels
    platformSizeRange: [90, 300],
 
    // a height range between rightmost platform and next platform to be spawned
    platformHeightRange: [-5, 5],
 
    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 20,
 
    // platform max and min height, as screen height ratio
    platformVerticalLimit: [0.4, 0.8],
 
    // player gravity
    playerGravity: 900,
 
    // player jump force
    jumpForce: 400,
 
    // player starting X position
    playerStartPosition: 500,
 
    // consecutive jumps allowed
    jumps: 2,
 
    // % of probability a coin appears on the platform
    coinPercent: 35,
    
    // size values for the game 
    width: 1280,

    height: 720
 
}
 
window.onload = function() {
 
    // object containing configuration options
    let gameConfig = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        scene: [preloadGame, startMenu, intro, gameOver, victory, playGame, Highscore],
        backgroundColor: 0x17202a,
        audio: { disableWebAudio: true},
        physics: { default: "arcade" },
    }
    
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}

// for labels
const formatScore = (score) => `Score: ${score}`
const formatLives = (lives) => `Lives: ${lives}`

let lives = 0
let score = 0

// for text centering
const screenCenterX = gameOptions.width / 2;
const screenCenterY = gameOptions.height / 2;

// Classes for reusing objects, works quite weirdly, as the methods still need to be defined in scenes, but won't work without these.
class ScoreLabel extends Phaser.GameObjects.Text
{
	constructor(scene, x, y, score, style)
	{
		super(scene, x, y, formatScore(score), style)

		this.score = score
	}
    
	setScore(score)
	{
		this.score  = score
		this.updateScoreText()
	}

	add(points)
	{
		this.setScore(this.score + points)
	}

	updateScoreText()
	{
		this.setText(formatScore(this.score))
	}
}

class LivesLabel extends Phaser.GameObjects.Text
{
	constructor(scene, x, y, lives, style)
	{
		super(scene, x, y, formatLives(lives), style)

		this.lives = lives
	}

    setLives(lives)
	{
		this.lives  = lives
		this.updateLivesText()
	}

    add(points)
	{
		this.setLives(this.lives + points)
	}

    remove(points)
	{
		this.setScore(this.lives - points)
	}

	updateLivesText()
	{
		this.setText(formatLives(this.lives))
	}

}
class Button extends Phaser.GameObjects.Text
{
    constructor(x, y, label, scene, callback) {
        const button = scene.add.text(x, y, label)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => button.setStyle({ fill: '#FFF' }));
    }
}

// preloadGame scene
class preloadGame extends Phaser.Scene{
    constructor(){
        super("PreloadGame");
    }
    preload(){
        // loads font, images and platform sprite
        this.load.bitmapFont('arcade', 'assets/arcade.png', 'assets/arcade.xml');
        this.load.image("platform", "assets/platform.png");
        this.load.image('picture1', 'assets/picture1.png');
        this.load.image('picture2', 'assets/picture2.png');
        this.load.image('picture3', 'assets/picture3.png');
        this.load.image('picture4', 'assets/picture4.png');
        this.load.image('picture5', 'assets/picture5.png');
        this.load.image('logo', 'assets/narsulogo.png');
        this.load.image("demoni", "assets/narsudemoni.png");


        // player is a sprite sheet made by 24x48 pixels
        this.load.spritesheet("player", "assets/player.png", {
            frameWidth: 24,
            frameHeight: 48
        });
 
        // the coin is a sprite sheet made by 20x20 pixels
        this.load.spritesheet("coin", "assets/coin.png", {
            frameWidth: 20,
            frameHeight: 20
        });
 
        // mountains are a sprite sheet made by 512x512 pixels
        this.load.spritesheet("mountain", "assets/mountain.png", {
            frameWidth: 512,
            frameHeight: 512
        });
        

        // loads music and sound effects
        this.load.audio("music", "assets/music.ogg")
        this.load.audio("coin", "assets/coin.ogg")
        this.load.audio("hurt", "assets/hurt.ogg")
        this.load.audio("death", "assets/death.ogg")
        this.load.audio("gameover", "assets/gameover.ogg")
        this.load.audio("victory", "assets/victory.ogg")
        this.load.audio("menu", "assets/menu.ogg")
        this.load.audio("jump", "assets/jump.ogg")


    }
    create(){

        // setting player animation
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("player", {
                start: 0,
                end: 1
            }),
            frameRate: 8,
            repeat: -1
        });
 
        // setting coin animation
        this.anims.create({
            key: "rotate",
            frames: this.anims.generateFrameNumbers("coin", {
                start: 0,
                end: 5
            }),
            frameRate: 15,
            yoyo: true,
            repeat: -1
        });
 
        this.scene.start("StartMenu");
    }
}

// startMenu scene
class startMenu extends Phaser.Scene{
    constructor(){
        super("StartMenu");
        
    }
    
    create(){
    
    // configures menu background music  
    this.sound.removeByKey("victory")
    this.sound.removeByKey("gameover")
    let menubgmconf = {
        mute: false,
        volume: 0.1,
        loop: true,
        delay: 0
    } 
    
    let menubgm = this.sound.add("menu")
    let menubgmstate = menubgm.isPlaying
    if(menubgmstate === false){
        menubgm.play(menubgmconf)
    }

    this.logo = this.add.image(screenCenterX, 230, "logo").setScale(0.6)
    
    this.getHighscores()
    
    this.startButton = this.add.text(screenCenterX, 450, 'Start Game', { fill: '#AFAFAF ', fontSize: "3rem" })
     .setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.scene.start("Intro") ) 
     .on('pointerover', () => this.enterstartButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() );

    this.skipButton = this.add.text(screenCenterX, 550, '(Skip intro)', { fill: '#AFAFAF ', fontSize: "3rem" })
     .setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.scene.start("PlayGame") ) 
     .on('pointerover', () => this.enterskipButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() );


     this.hiscoreButton = this.add.text(screenCenterX, 650, 'View highscores', { fill: '#AFAFAF ', fontSize: "2.8rem" })
     .setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.scene.start("Highscore") ) 
     .on('pointerover', () => this.enterhiscoreButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() )

     this.helptext = this.add.text(screenCenterX, 690, "Hint: if the scores aren't updating, try refreshing or relogging in.", { fill: '#AFAFAF ', fontSize: "1rem" }).setOrigin(0.5)
    }
    
    enterstartButtonHoverState() {
        this.startButton.setStyle({ fill: '#ff0'});
    }
    enterButtonRestState() {
        this.startButton.setStyle({ fill: '#AFAFAF' });
        this.skipButton.setStyle({ fill: '#AFAFAF' });
        this.hiscoreButton.setStyle({ fill: '#AFAFAF' });


    }
    enterskipButtonHoverState() {
        this.skipButton.setStyle({ fill: '#ff0'}); 
    }
    enterhiscoreButtonHoverState() {
        this.hiscoreButton.setStyle({ fill: '#ff0'}); 
    }
    
    getHighscores(){
        $.ajax({
            type: 'GET',
            url: '/scores',
            success: function(newdata) {
              scores = newdata;
            },
          
            error: function(xhr) {
              console.log(xhr);
            }
          
        })
    }
    
}

// intro scene
class intro extends Phaser.Scene{
    constructor(){
        super("Intro");
        
    }
    
    create(){
    this.sound.removeByKey("victory")
    this.sound.removeByKey("gameover")
    

    this.image = this.add.image(640, 360, "picture1")

    this.timedEvent1 = this.time.delayedCall(5000, this.onEvent, [], this);
    this.timedEvent2 = this.time.delayedCall(10000, this.onEvent2, [], this);
    this.timedEvent3 = this.time.delayedCall(15000, this.onEvent3, [], this);
    this.timedEvent4 = this.time.delayedCall(20000, this.onEvent4, [], this);
    this.timedEvent5 = this.time.delayedCall(25000, this.onEvent5, [], this);

    
    }

    onEvent(){
        this.add.image(640, 360, "picture2");
    }
    onEvent2(){
        this.add.image(640, 360, "picture3");
    }
    onEvent3(){
        this.add.image(640, 360, "picture4");
    }
    onEvent4(){
        this.add.image(640, 360, "picture5");
    }
    onEvent5(){
        this.scene.start("PlayGame")
    }

}

// Victory scene
class victory extends Phaser.Scene{
    constructor(){
        super("Victory");
        
    }

    create(data){
        $.ajax({
            type: 'GET',
            url: '/scores',
            success: function(newdata) {
              scores = newdata;
            },
          
            error: function(xhr) {
              console.log(xhr);
            }
          
        })

    this.sound.removeByKey("menu")
    this.sound.removeByKey("music")
    this.sound.play("victory")

    this.scoreText = this.add.text(screenCenterX, 300, `Final score: ${data.score}`, {fill: "#AFAFAF", fontSize: "2.5rem"}).setOrigin(0.5)
    this.loreText = this.add.text(screenCenterX, 170, `Pääsit pakoon Narsulta, ja ostit keräämälläsi rahalla rinnakkaisluokkalaiselta valmiin palautuksen!`, {fill: "#AFAFAF", fontSize: "1.3rem"}).setOrigin(0.5)
    this.lore2Text = this.add.text(screenCenterX, 190, `Selviydyit sankarillisesti Projektitoiminta ja käytänteet-kurssista.`, {fill: "#AFAFAF", fontSize: "1.3rem"}).setOrigin(0.5)
    this.lore3Text = this.add.text(screenCenterX, 210, `Seuraavana koitoksena odottaa Future Factory...`, {fill: "#AFAFAF", fontSize: "1.3rem"}).setOrigin(0.5)
     
    
    this.score = data.score
    
    this.titleText = this.add.text(screenCenterX, 100, "Victory!", { fill: "#ff0", fontSize: "4rem",  }).setOrigin(0.5)
    
    this.retryButton = this.add.text(screenCenterX, 450, 'Try again?', { fill: '#AFAFAF ', fontSize: "3rem" }).setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.scene.start("PlayGame") ) 
     .on('pointerover', () => this.enterretryButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() );
    
    this.submitButton = this.add.text(screenCenterX, 550, 'Submit score', { fill: '#AFAFAF ', fontSize: "3rem" }).setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.submitScore() ) 
     .on('pointerover', () => this.entersubmitButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() );
     
    this.skipButton = this.add.text(screenCenterX, 650, 'Back to main menu (without submitting score)', { fill: '#AFAFAF ', fontSize: "2.8rem" })
     .setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.scene.start("StartMenu") ) 
     .on('pointerover', () => this.enterskipButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() )
    
    }

    submitScore(){
        $.ajax({
            type: "POST",
            url: "/submit-score",
            data: JSON.stringify({"email": `${userEmail}`,"score": `${this.score}`}),
            headers: {
            "Content-Type": "application/json"
            }
        })
        
        this.scene.start("StartMenu")

    }
    enterretryButtonHoverState(){
        this.retryButton.setStyle({ fill: '#ff0'});
    }

    entersubmitButtonHoverState() {
        this.submitButton.setStyle({ fill: '#ff0'});

    }

    enterskipButtonHoverState(){
        this.skipButton.setStyle({ fill: '#ff0'});
    }

    enterButtonRestState() {
        this.retryButton.setStyle({ fill: '#AFAFAF' });
        this.submitButton.setStyle({ fill: '#AFAFAF' });
        this.skipButton.setStyle({ fill: '#AFAFAF' });


    }
}

// gameOver scene
class gameOver extends Phaser.Scene{
    constructor(){
        super("GameOver");
        
    }

    create(data){
        $.ajax({
            type: 'GET',
            url: '/scores',
            success: function(newdata) {
              scores = newdata;
            },
          
            error: function(xhr) {
              console.log(xhr);
            }
          
        })

        // Old code from trying to resolve the issue of better scores getting replaced, ran out of time unfortunately

        // scoreValue = this.contains(scores, userEmail)
        // // checks if user email is included in the scoreboard, if it is,
        // // but score is higher than previous, uploads it.
        // // if it isnt higher, doesnt upload it, if user is not on scoreboard, uploads score. 
        // if(scores.includes(userEmail) === true){
        //     if(scores[scoreValue].highScore < data.score){
        //         $.ajax({
        //             type: "POST",
        //             url: "/submit-score",
        //             data: JSON.stringify({"email": `${userEmail}`,"score": `${data.score}`}),
        //             headers: {
        //             "Content-Type": "application/json"
        //             }
        //         })
        //     }
            
        // }
        // else if (scores.includes(userEmail) === false){
        //     $.ajax({
        //         type: "POST",
        //         url: "/submit-score",
        //         data: JSON.stringify({"email": `${userEmail}`,"score": `${data.score}`}),
        //         headers: {
        //         "Content-Type": "application/json"
        //         }
        //     })
        // }

    this.sound.removeByKey("menu")
    this.sound.removeByKey("music")
    this.sound.play("gameover")

    this.scoreText = this.add.text(screenCenterX, 300, `Final score: ${data.score}`, {fill: "#AFAFAF", fontSize: "2.5rem"}).setOrigin(0.5)
    this.loreText = this.add.text(screenCenterX, 170, `Et päässyt Narsua pakoon, joten vietit seuraavat 18 tuntia väkisin tehden palautusta.`, {fill: "#AFAFAF", fontSize: "1.3rem"}).setOrigin(0.5)
    this.lore2Text = this.add.text(screenCenterX, 190, `Palautus ei kuitenkaan mennyt läpi, ja sait hylätyn Projektitoiminta ja käytänteet kurssista.`, {fill: "#AFAFAF", fontSize: "1.3rem"}).setOrigin(0.5)
    this.lore3Text = this.add.text(screenCenterX, 210, `Mitäköhän tapahtuisi jos kerää 500 edestä kolikoita...`, {fill: "#AFAFAF", fontSize: "1.3rem"}).setOrigin(0.5)
     
    this.score = data.score
    
    this.titleText = this.add.text(screenCenterX, 100, "Game Over", { fill: "#DE0520", fontSize: "4rem",  }).setOrigin(0.5)
    
    this.retryButton = this.add.text(screenCenterX, 450, 'Try again?', { fill: '#AFAFAF ', fontSize: "3rem" }).setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.scene.start("PlayGame") ) 
     .on('pointerover', () => this.enterretryButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() );
    
    this.submitButton = this.add.text(screenCenterX, 550, 'Submit score', { fill: '#AFAFAF ', fontSize: "3rem" }).setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.submitScore() ) 
     .on('pointerover', () => this.entersubmitButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() );
     
    this.skipButton = this.add.text(screenCenterX, 650, 'Back to main menu (without submitting score)', { fill: '#AFAFAF ', fontSize: "2.8rem" })
     .setOrigin(0.5)
     .setInteractive()
     .on('pointerdown', () => this.scene.start("StartMenu") ) 
     .on('pointerover', () => this.enterskipButtonHoverState() )
     .on('pointerout', () => this.enterButtonRestState() )
    
    }

    submitScore(){
        $.ajax({
            type: "POST",
            url: "/submit-score",
            data: JSON.stringify({"email": `${userEmail}`,"score": `${this.score}`}),
            headers: {
            "Content-Type": "application/json"
            }
        })
        
        this.scene.start("StartMenu")

    }
    enterretryButtonHoverState(){
        this.retryButton.setStyle({ fill: '#ff0'});
    }

    entersubmitButtonHoverState() {
        this.submitButton.setStyle({ fill: '#ff0'});

    }

    enterskipButtonHoverState(){
        this.skipButton.setStyle({ fill: '#ff0'});
    }

    enterButtonRestState() {
        this.retryButton.setStyle({ fill: '#AFAFAF' });
        this.submitButton.setStyle({ fill: '#AFAFAF' });
        this.skipButton.setStyle({ fill: '#AFAFAF' });


    }
}

// playGame scene
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
        
    }
    
    create(){
        score = 0
        // creates life label
        lives = 2
        this.livesLabel = this.createLivesLabel(16, 50, 3)
        
        this.sound.removeByKey("menu")
        this.sound.removeByKey("victory")
        this.sound.removeByKey("gameover")


        // configures background music
        let music = this.sound.add("music")
        let musicconf = {
            mute: false,
            volume: 0.1,
            loop: true,
            delay: 0
        }
        music.play(musicconf)
        
        this.infotext = this.add.text(screenCenterX, 130, 'Click to jump!', { fill: '#AFAFAF ', fontSize: "3rem" })

        this.timedEvent1 = this.time.delayedCall(3000, this.onEvent, [], this);

        // creates score label
        this.scoreLabel = this.createScoreLabel(16, 16, 0)

        // group with all active mountains.
        this.mountainGroup = this.add.group();
 
        // group with all active platforms.
        this.platformGroup = this.add.group({
 
            // once a platform is removed, it's added to the pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });
        
        this.narsu = this.add.image(100, 420, "demoni").setDepth(2)

        // platform pool
        this.platformPool = this.add.group({
 
            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });
 
        // group with all active coins.
        this.coinGroup = this.add.group({
 
            // once a coin is removed, it's added to the pool
            removeCallback: function(coin){
                coin.scene.coinPool.add(coin)
            }
        });
 
        // coin pool
        this.coinPool = this.add.group({
 
            // once a coin is removed from the pool, it's added to the active coins group
            removeCallback: function(coin){
                coin.scene.coinGroup.add(coin)
            }
        });

        // adding a mountain
        this.addMountains()
 
        // keeping track of added platforms
        this.addedPlatforms = 0;
 
        // number of consecutive jumps made by the player so far
        this.playerJumps = 0;
 
        // adding a platform to the game, the arguments are platform width, x position and y position
        this.addPlatform(game.config.width, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);
 
        // adding the player;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.7, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);
 
        // the player is not dying
        this.dying = false;
 
        // setting collisions between the player and the platform group
        this.platformCollider = this.physics.add.collider(this.player, this.platformGroup, function(){
 
            // play "run" animation if the player is on a platform
            if(!this.player.anims.isPlaying){
                this.player.anims.play("run");
            }
        }, null, this);
 
        // setting collisions between the player and the coin group
        this.physics.add.overlap(this.player, this.coinGroup, function(player, coin){
            this.sound.play("coin")
            this.scoreLabel.add(50)
            score = score + 50
            this.coinGroup.killAndHide(coin);
            this.coinGroup.remove(coin);
        }, null, this);
        
        // checking for input
        this.input.on("pointerdown", this.jump, this);

    }

    // removes info text after 3 seconds
    onEvent(){
        this.infotext.setVisible(false)
    }

    // updates score text
    setScore(score){
		this.score = score
		this.updateScoreText()
	}

	updateScoreText(){
		this.setText(formatScore(this.score))
	}
    // creating scorelabel
    createScoreLabel(x, y, score)
	{
		const style = { fontSize: '32px', fill: '#AFAFAF' }
		const label = new ScoreLabel(this, x, y, score, style)

		this.add.existing(label)

		return label
	}

    // updates score text
    setLives(lives){
		this.lives = lives
		this.updateLivesText()
	}
    
    updateLivesText(){
		this.setText(formatLives(this.lives))
	}

    // creating scorelabel
    createLivesLabel(x, y, score)
    {
        const style = { fontSize: '32px', fill: '#AFAFAF' }
        const label = new LivesLabel(this, x, y, score, style)

        this.add.existing(label)

        return label
    }

    // adding mountains
    addMountains(){
        let rightmostMountain = this.getRightmostMountain();
        if(rightmostMountain < game.config.width * 2){
            let mountain = this.physics.add.sprite(rightmostMountain + Phaser.Math.Between(100, 350), game.config.height + Phaser.Math.Between(0, 100), "mountain");
            mountain.setOrigin(0.5, 1);
            mountain.body.setVelocityX(gameOptions.mountainSpeed * -1)
            this.mountainGroup.add(mountain);
            if(Phaser.Math.Between(0, 1)){
                mountain.setDepth(1);
            }
            mountain.setFrame(Phaser.Math.Between(0, 3))
            this.addMountains()
        }
    }
 
    // getting rightmost mountain x position
    getRightmostMountain(){
        let rightmostMountain = -200;
        this.mountainGroup.getChildren().forEach(function(mountain){
            rightmostMountain = Math.max(rightmostMountain, mountain.x);
        })
        return rightmostMountain;
    }
 
    // the core of the script: platform are added from the pool or created on the fly
    addPlatform(platformWidth, posX, posY){
        this.addedPlatforms ++;
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            let newRatio =  platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;
        }
        else{
            platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
            platform.setDepth(2);
            this.platformGroup.add(platform);
        }
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
 
        // if this is not the starting platform...
        if(this.addedPlatforms > 1){
 
            // is there a coin over the platform?
            if(Phaser.Math.Between(1, 100) <= gameOptions.coinPercent){
                if(this.coinPool.getLength()){
                    let coin = this.coinPool.getFirst();
                    coin.x = posX;
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinPool.remove(coin);
                }
                else{
                    let coin = this.physics.add.sprite(posX, posY - 96, "coin");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    coin.anims.play("rotate");
                    coin.setDepth(2);
                    this.coinGroup.add(coin);
                }
            }
        }
    }
 
    // the player jumps when on the ground, or twice in the air as long as there are jumps left and the first jump was on the ground
    // and obviously if the player is not dying
    jump(){
        if((!this.dying) && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps))){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;
            this.sound.play("jump")
            // stops animation
            this.player.anims.stop();
        }
    }
 
    update(){

        // game over
        if(this.player.y > game.config.height){
            if(lives < 0){
            this.sound.play("death")
            if(score >= 500){
            this.scene.start("Victory", {score: score})
            lives = 2
            }
            else { this.scene.start("GameOver", {score: score})
            lives = 2
            }
            }
            this.sound.play("hurt")
            this.playerJumps = 1;
            this.livesLabel.add(-1);
            lives--
            this.player.y = gameOptions.playerStartPosition - 400;
            this.player.body.setVelocityY(-200);
            this.dying = false;
        }
 
        // keeps player static
        this.player.x = gameOptions.playerStartPosition;

        // recycling platforms
        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance){
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);
 
        // recycling coins
        this.coinGroup.getChildren().forEach(function(coin){
            if(coin.x < - coin.displayWidth / 2){
                this.coinGroup.killAndHide(coin);
                this.coinGroup.remove(coin);
            }
        }, this);
 
        // recycling mountains
        this.mountainGroup.getChildren().forEach(function(mountain){
            if(mountain.x < - mountain.displayWidth){
                let rightmostMountain = this.getRightmostMountain();
                mountain.x = rightmostMountain + Phaser.Math.Between(100, 350);
                mountain.y = game.config.height + Phaser.Math.Between(0, 100);
                mountain.setFrame(Phaser.Math.Between(0, 3))
                if(Phaser.Math.Between(0, 1)){
                    mountain.setDepth(1);
                }
            }
        }, this);
 
        // adding new platforms
        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }
    }
}

// scoreboard scene
class Highscore extends Phaser.Scene {
    constructor() {
      super("Highscore");
      this.scores = [];
    }
   
    preload() {
      this.load.bitmapFont('arcade', 'assets/arcade.png', 'assets/arcade.xml');

      $.ajax({
        type: 'GET',
        url: '/scores',
        success: function(newdata) {
          scores = newdata;
        },
      
        error: function(xhr) {
          console.log(xhr);
        }
      
    })
    }
   
    create() {
    this.skipButton = this.add.text(screenCenterX, 550, 'Back to main menu', { fill: '#AFAFAF ', fontSize: "2.8rem" })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.scene.start("StartMenu") ) 
        .on('pointerover', () => this.enterButtonHoverState() )
        .on('pointerout', () => this.enterButtonRestState() )
    
    this.add.bitmapText(350, 110, 'arcade', 'RANK  SCORE   NAME').setTint(0xffffff);
      for (let i = 1; i < 6; i++) {
        if (scores[i-1]) {
            if(scores[i-1].highScore >= 1000){
                this.add.bitmapText(350, 160 + 50 * i, 'arcade', `${i}     ${scores[i-1].highScore}    ${scores[i-1].name}`).setTint(0xffffff)
            }
            else {this.add.bitmapText(350, 160 + 50 * i, 'arcade', `${i}     ${scores[i-1].highScore}     ${scores[i-1].name}`).setTint(0xffffff)}
        } else {
          this.add.bitmapText(350, 160 + 50 * i, 'arcade', `${i}     0       ---`).setTint(0xffffff)
        }
      }
    }
    enterButtonHoverState(){
        this.skipButton.setStyle({ fill: '#ff0'});
    }
    enterButtonRestState() {
        this.skipButton.setStyle({ fill: '#AFAFAF' });
    }
}

function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}