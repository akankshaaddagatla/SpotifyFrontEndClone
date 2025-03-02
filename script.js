async function getSongs(){
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs=[];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href);
        }
    }
    
    return songs;
}

const playMusic = (track,pause=false) =>{
    currentSong.src = track;
    if(!pause){
        currentSong.play();
        document.querySelector("#playBtn img").src = "svgs/pause.svg";
        // getSongLiByUrl(currentSong).querySelector("#playLi img").src = "svgs/pause.svg";
    }
}

async function addSongsToPage() {
    //get list of songs
    songs = await getSongs();

    //looping for adding all songs in playlists
    let songg = document.querySelector(".playlists");
    for (const song of songs) {
        let songgg = song.split("128-")[1].split("%20-")[0].replaceAll("%20"," ");
        let imgSrc = `songsImages/${songgg}Img.jpg`;
        let imgS = imgSrc.replaceAll(" ","");
        songg.innerHTML = songg.innerHTML+
                   `<div class="song">
                        <div class="songImg flex">
                            <img src="${imgS}">
                        </div>
                        <div class="songDetails">
                            <div class="songName">${songgg}</div>
                            <div class="songhref">${song}</div>
                            <div class="sdetail">Artist</div>
                        </div>
                        <div class="playButton">
                            <svg width="60" height="60" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#1ED760"/>
                                <path d="M10 8.5l5 3.5-5 3.5V8.5z" fill="black"/>
                            </svg>                                                                                                                                                 
                        </div>
                    </div>`;
    }  
    playMusic(songs[0],true);
    addSongToLibrary(document.querySelector(".playlists").firstElementChild);
    playBar(document.querySelector(".playlists").firstElementChild);
    

    //Attach an event listener to each song
    document.querySelectorAll(".song .playButton").forEach(playBtn=> {
        playBtn.addEventListener("click", (e)=>{
            e.stopPropagation();
            const songDiv = playBtn.closest(".song");
            playMusic(songDiv.querySelector(".songhref").innerText);
            addSongToLibrary(songDiv);
            playBar(songDiv);
            
        })
    })

}

function getSongDivByUrl(songUrl) {
    let s = document.querySelectorAll(".song");
    for (let song of s) {
        let songHref = song.querySelector(".songhref").innerText;
        if (songHref === songUrl) {
            return song; 
        }
    }
    return null; 
}

function playBar(songDiv){
    let imgSrc = songDiv.querySelector("img").src;
    let songName = songDiv.querySelector(".songName").innerText;
    let leftPlayBar = document.querySelector(".leftPlayBar");
    leftPlayBar.innerHTML = `<div class="currSongImg"><img src="${imgSrc}"></div>
                            <div class="currSongDetails">
                                <div class="currSongName">${songName}</div>
                                <div class="currSongArtist">Artist</div>
                            </div>`;
    
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Format as MM:SS with leading zeros if needed
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function addSongToLibrary(songDiv) {
    let songUl = document.querySelector(".songList ul");
    let song = songDiv.querySelector(".songName").innerText;
    let songHref = songDiv.querySelector(".songhref").innerText;
    if (!songUl) return;

    let imgSrc = `songsImages/${song}Img.jpg`.replace(/ /g, "");

    let existingSong = [...songUl.children].find(li => 
        li.querySelector(".listSongName")?.textContent.trim() === song
    );

    if (existingSong) {
        songUl.prepend(existingSong);
    }else {
        let songItem = document.createElement("li");
        songItem.innerHTML = `
            <div class="listImg">
                <img src="${imgSrc}" alt="${song}">
                <div id="playLi"><img class="invertCom" src="svgs/play.svg" alt="Play"></div>
            </div>
            <div class="listDetails">
                <div class="listSongHref" style="display:none">${songHref}</div>
                <div class="listSongName">${song}</div>
                <div class="listArtistName">Artist</div>
            </div>`; 

        songUl.prepend(songItem);
    }
    getSongLiByUrl(currentSong).style.backgroundColor = "#1f1f1f";
    

    //Attach an event listener to each song in library
    let playLi = document.querySelector("#playLi img");
    playLi.addEventListener("click",(e)=>{
        e.stopPropagation();
        playMusic(songDiv.querySelector(".songhref").innerHTML);
        playBar(songDiv);
        // playLi.src = "svgs/pause.svg";
        getSongLiByUrl(currentSong).style.backgroundColor = "#1f1f1f";
    });
}

function playNextSong(){
    let songDiv = getSongDivByUrl(currentSong.src);
    let index = songs.indexOf(currentSong.src);
    if((index+1) < songs.length){
        playMusic(songs[index+1]);
        playBar(songDiv.nextElementSibling);
        addSongToLibrary(songDiv.nextElementSibling);
    }else{
        playMusic(songs[0]);
        addSongToLibrary(document.querySelector(".playlists").firstElementChild);
        playBar(document.querySelector(".playlists").firstElementChild);
    }
}



function getSongLiByUrl(songUrl) {
    let lis = document.getElementsByTagName("li");
    console.log(lis);
    if(lis.length == 1){
        for (const li of lis) {
            let songHref = li.querySelector(".listSongHref").innerText;
            if (songHref === songUrl.src) {
                return li; 
            }
        }
        return null;
    }else{
        for (const li of lis) {
            li.style.backgroundColor = "#121212"
        }
        for (const li of lis) {
            let songHref = li.querySelector(".listSongHref").innerText;
            if (songHref === songUrl.src) {
                return li; 
            }
        }
        return null;
    }
    
     
}

let currentSong = new Audio();
let play = document.querySelector("#playBtn img")
let songs;
function main(){ 
    addSongsToPage();

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        if(currentSong.currentTime == currentSong.duration){
            playNextSong();
        }
        document.querySelector(".currTime").innerHTML = formatTime(currentSong.currentTime);
        document.querySelector(".totalTime").innerHTML = formatTime(currentSong.duration);
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    });

    //evnt listener on seekbar
    document.querySelector(".bar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration)*percent/100;
    })

    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "svgs/pause.svg";
            // getSongLiByUrl(currentSong).querySelector("#playLi img").src = "svgs/pause.svg";
        }else{
            currentSong.pause();
            play.src = "svgs/play.svg";
            // getSongLiByUrl(currentSong).querySelector("#playLi img").src = "svgs/play.svg";
       }
    })



    // getSongLiByUrl(currentSong).querySelector("#playLi img").addEventListener("click",()=>{
    //     if(currentSong.paused){
    //         currentSong.play();
    //         getSongLiByUrl(currentSong).querySelector("#playLi img").src = "svgs/pause.svg";
    //         play.src = "svgs/pause.svg";
    //     }else{
    //         currentSong.pause();
    //         getSongLiByUrl(currentSong).querySelector("#playLi img").src = "svgs/play.svg";
    //         play.src = "svgs/play.svg";
    //    }
    // })
    

    //Attach event listener to library logo
    document.querySelector(".libraryLogo").addEventListener("click",()=>{
        document.querySelector(".cross img").style.display = "block";
        document.querySelector(".right").style.width = "100vw";
        document.querySelector(".right").style.marginLeft = "310px";
        document.querySelector(".libraryLogo p").style.display = "block";
        document.querySelector(".leftFooter").style.display = "block";
        document.querySelector(".leftBody").style.display = "block"; 
        document.querySelector(".main").style.position = "relative";
        document.querySelector(".left").style.position = "absolute";
        document.querySelector(".left").style.width = "300px";
    });
    
    //Attach event listener on cross icon
    document.querySelector(".cross img").addEventListener("click",()=>{
        document.querySelector(".left").style.width = "5vw";
        document.querySelector(".right").style.width = "94vw";
        document.querySelector(".right").style.marginLeft = "6vw";
        document.querySelector(".libraryLogo p").style.display = "none";
        document.querySelector(".leftFooter").style.display = "none";
        document.querySelector(".leftBody").style.display = "none";
        document.querySelector(".cross img").style.display = "none";
    });


    //Add an event listener to previuos icon
    document.querySelector(".previousB").addEventListener("click",()=>{
        let songDiv = getSongDivByUrl(currentSong.src);
        let index = songs.indexOf(currentSong.src);
        
        if((index-1) >= 0){
            playMusic(songs[index-1]);
            playBar(songDiv.previousElementSibling);
            addSongToLibrary(songDiv.previousElementSibling);
        }
    });

    //Add an event listener to next icon
    document.querySelector(".nextB").addEventListener("click",()=>{
        let songDiv = getSongDivByUrl(currentSong.src);
        let index = songs.indexOf(currentSong.src);
        
        if((index+1) < songs.length){
            playMusic(songs[index+1]);
            playBar(songDiv.nextElementSibling);
            addSongToLibrary(songDiv.nextElementSibling);
        }
    });
    

}

main();
