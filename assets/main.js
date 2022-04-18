const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'CONG_PLAYER'

const heading = $('.header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.toggle-play-btn')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.next-btn')
const prevBtn = $('.prev-btn')
const randomBtn = $('.random-btn')
const repeatBtn = $('.repeat-btn')
const playlist = $('.playlist')
 
const app = {
    currentIndex : 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './assets/music/nevada.mp3',
            image: './assets/img/nevada.jpg'
        },
        {
            name: '24h',
            singer: 'LyLy ft Magazine',
            path: './assets/music/24h.mp3',
            image: './assets/img/24h.jpg'
        },
        {
            name: 'Chạnh Lòng Thương Cô 2',
            singer: 'Huy Vạc',
            path: './assets/music/chanhLongThuongCo2.mp3',
            image: './assets/img/chanhLongThuongCo2.jpg'
        },
        {
            name: 'Đêm qua con nằm mơ',
            singer: 'Dimz',
            path: './assets/music/demQuaConNamMo.mp3',
            image: './assets/img/demQuaConNamMo.jpg'
        },
        {
            name: 'Đố em biết anh đang nghĩ gì?',
            singer: 'Đen ft Justatee',
            path: './assets/music/doEmBietAnhDangNghiGi.mp3',
            image: './assets/img/doEmBietAnhDangNghiGi.jpg'
        },
        {
            name: 'Monody',
            singer: 'The Fat Rat ft Laura Brehm',
            path: './assets/music/monody.mp3',
            image: './assets/img/monody.jpg'
        },
        {
            name: 'Summer Time',
            singer: 'Lana Del Ray',
            path: './assets/music/summerTime.mp3',
            image: './assets/img/summerTime.jpg'
        },
        {
            name: 'Từ trên cao nhìn xuống',
            singer: 'Kimmese, Tamka PKL, Suboi, Đen',
            path: './assets/music/tuTrenCaoNhinXuong.mp3',
            image: './assets/img/tuTrenCaoNhinXuong.jpg'
        },
        {
            name: 'Unstoppable',
            singer: 'Sia',
            path: './assets/music/unstoppable.mp3',
            image: './assets/img/unstoppable.jpg'
        },
        {
            name: 'What are words',
            singer: 'Chris Medina',
            path: './assets/music/whatAreWords.mp3',
            image: './assets/img/whatAreWords.jpg'
        } 
    ],
    render: function() {
        const htmls = this.songs.map((song,index)  => {
            return `
                <div class="song ${index === this.currentIndex? 'active':''}" data-index = ${index}>
                    <div class="thumb" style="background-image: url('${song.image}')"></div>
                    <div class="body">
                        <h3 class="song-name">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () { 
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        }) 
    },
    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity,
        })

        cdThumbAnimate.pause()

        // Xử lý phóng to/ thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lí khi click play
        playBtn.onclick = function () {
            if( _this.isPlaying) {
                audio.pause() 
            } else {
                audio.play() 
            }
        }

        // Khi bài hát được chạy 
        audio.onplay = function () { 
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi bài hát được dừng 
        audio.onpause = function () { 
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent 
            }
        }

        // Xử lý khi tua bài hát thay
        progress.onchange = function (e) { 
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi chuyển tiếp bài hát 
        nextBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play() 
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi lùi bài hát 
        prevBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play() 
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lí bật tắt random bài hát
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lí next bài khi audio ended
        audio.onended = function () {
            if(_this.isRepeat) {
                audio.play()
            }else {
                nextBtn.click()
            }
        }

        // Xử lí phát lại bài hát
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', this.isRepeat)
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active')
            if(songNode || e.target.closest('.option')) {
                
                // Xử lí khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //  Xử lí khi click vào song option
                if(e.target.closest('.option')) {

                }
            }
            
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig:function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    scrollToActiveSong: function () {
        setTimeout(function () {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    },
    nextSong: function () {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex 
        do {
            newIndex  = Math.floor(Math.random() * this.songs.length)
        } while(newIndex == this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // Lắng nghe/ xử lí các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render Playlist
        this.render()

        // Hiển thị trạng thái ban đầu của button repeat + random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()