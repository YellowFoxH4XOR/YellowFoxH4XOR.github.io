var context = new AudioContext();

var initNote = function() {
  var osc = context.createOscillator(),
    volume = context.createGain();

  volume.gain.value = 0.25;

  osc.frequency.value = 880;
  osc.type = 'square';

  osc.connect(volume);
  volume.connect(context.destination);
  osc.start(context.currentTime);
  osc.stop(context.currentTime + 0.15);
};
