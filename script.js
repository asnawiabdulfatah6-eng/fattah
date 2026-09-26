/* ---------- Dark mode toggle ---------- */
(function(){
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if(btn){ btn.textContent = theme === 'dark' ? '☀️' : '🌙'; }
  }
  var saved = null;
  try{ saved = localStorage.getItem('bibi-theme'); }catch(e){}
  if(saved === 'dark' || saved === 'light'){ applyTheme(saved); }

  window.toggleTheme = function(){
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try{ localStorage.setItem('bibi-theme', next); }catch(e){}
  };
})();

/* ---------- Birthday tune + scrolling lyrics ---------- */
(function(){
  var ctx = null;
  var isPlaying = false;
  var timeouts = [];

  var phrases = [
    {
      notes:[[523.25,0.35],[523.25,0.35],[587.33,0.5],[523.25,0.5],[698.46,0.5],[659.25,0.9]],
      lyric:"Happy birthday, Bibi, our shining star,"
    },
    {
      notes:[[523.25,0.35],[523.25,0.35],[587.33,0.5],[523.25,0.5],[783.99,0.5],[698.46,0.9]],
      lyric:"a kind social worker's heart, near or far,"
    },
    {
      notes:[[523.25,0.35],[523.25,0.35],[1046.50,0.5],[880.00,0.5],[698.46,0.5],[659.25,0.5],[587.33,0.9]],
      lyric:"white like your calm, blue like your dreams so true,"
    },
    {
      notes:[[932.33,0.35],[932.33,0.35],[880.00,0.5],[698.46,0.5],[783.99,0.5],[698.46,1.1]],
      lyric:"your uncle's so proud of everything you do."
    }
  ];

  function playNote(freq, startTime, dur){
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.05);
  }

  function showLyric(text){
    var el = document.getElementById('lyricLine');
    if(!el) return;
    el.classList.remove('show');
    setTimeout(function(){
      el.textContent = text;
      el.classList.add('show');
    }, 120);
  }

  function schedulePhrase(index){
    if(!isPlaying) return;
    var phrase = phrases[index % phrases.length];
    showLyric(phrase.lyric);
    var t = ctx.currentTime + 0.1;
    phrase.notes.forEach(function(note){
      playNote(note[0], t, note[1] * 0.92);
      t += note[1];
    });
    var totalMs = (t - ctx.currentTime) * 1000;
    timeouts.push(setTimeout(function(){
      schedulePhrase(index + 1);
    }, totalMs));
  }

  window.toggleMusic = function(){
    var btn = document.getElementById('musicBtn');
    var label = document.getElementById('musicLabel');
    var lyricEl = document.getElementById('lyricLine');
    if(!isPlaying){
      if(!ctx){ ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      if(ctx.state === 'suspended'){ ctx.resume(); }
      isPlaying = true;
      btn.classList.add('playing');
      label.textContent = 'Pause the tune';
      schedulePhrase(0);
    } else {
      isPlaying = false;
      btn.classList.remove('playing');
      label.textContent = 'Play a little birthday tune';
      timeouts.forEach(clearTimeout);
      timeouts = [];
      if(lyricEl){ lyricEl.classList.remove('show'); }
    }
  };
})();