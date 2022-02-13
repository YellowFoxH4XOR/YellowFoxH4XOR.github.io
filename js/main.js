$(document).ready(function() {
  $('#preload').show();
  $('#frame').hide();
  $('#loading').hide();
  $('#cursor-blank').hide();
  $('#error').hide();
  $('#serverReady').hide();

  $(document).on({
    keypress: function(e) {
      if (e.which === 13) {
        initMachine();
        $(this).off(e);
      }
    }
  });

  $(document).on({
    touchstart: function(e) {
      initMachine();
      $(this).off(e);
    }
  });

  $('#switch').on('click', function() {
    $(this).toggleClass('switch-on', 'remove');
    $(this).toggleClass('switch-off', 'add');
    $('#screen').toggleClass('on', 'remove');
    $('#screen').toggleClass('off', 'add');
  });
});

function initMachine() {
  $('#preload').hide();
  $('#frame')
    .css('visibility', 'visible')
    .show();

  console.log(
    "H3ll0 Y0u C0d3 V0y3ur!! I'll open source this site when it ressembles something :P Don't forget to say hi on twitter -> @yellowfox_h4xor"
  );
  var loading = function() {
    setTimeout(function() {
      initNote();
      console.log('Loaded');
    }, 730);

    $('#loading')
      .show()
      .append()
      .typed({
        strings: [
          '...',
          '...',
          '<small><span class="warning">Warning: ** This site is a prototype **^500</span></small>',
          '<small>Work: <span class="ok">Local/remote</span><br>Job: <span class="ok">Software Engineer @Societe Generale India</span><br>Languages: <span class="ok">HTML5 - CSS <i>(Sass-Less)</i> - Js <i>(jQuery-React-Ember-Meteor)</i></span><br>Platforms: <span class="ok">Web/Mobile</span></small><br>'
        ],
        showCursor: false,
        contentType: 'html'
      });
  };
  var loadingOff = function() {
    $('#loading').hide();
  };

  var errorShow = function() {
    $('#error').show();
  };
  var errorHide = function() {
    $('#error').hide();
  };

  var thinking = function() {
    $('.thinking').hide();
  };

  var serverReady = function() {
    $('#serverReady').show();
  };
  var serverReadyHide = function() {
    $('#serverReady').hide();
  };

  var welcomeText = function() {
    $('#frame #screen .text span').typed({
      strings: [
        'Hello there! :)',
        'How are you?',
        "My name is Akshat and i'm a full stack developer.<br>I currently work from India.<br><br> I love building things for the web. My areas of interest are:<br><br>- RESEARCH and DEVELOPMENT<br>- UI ENGINEERING <i><small>(User interface)</small></i><br>- UX DESIGN <i><small>(User experience)</small></i><br>- PRODUCT DESIGN <br>- PROTOTYPE DEVELOPMENT<br>- WEB/MOBILE CONSULTING<br><br>  <small>This is part of an UI research I made.</small><br><br>If you want to get in touch, please contact me on twitter<br>or throw me an email akshatkatiyar4@gmail.com<br><br>Thank you for stopping by!<br><br>:P<br><br>  – @kk!<br><br><small>** Please continue with the buttons on the right <i>(external links for now)</i> **</small>"
      ],
      contentType: 'html',
      loop: false,
      startDelay: 1200
    });
  };

  setTimeout(loading, 1400);
  setTimeout(loadingOff, 19000);
  setTimeout(errorShow, 1800);
  setTimeout(errorHide, 2500);
  setTimeout(thinking, 19700);
  setTimeout(serverReady, 19300);
  setTimeout(serverReadyHide, 19700);
  setTimeout(welcomeText, 20000);
}
