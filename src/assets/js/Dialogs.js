import CCToolkit from './WebToolkit';
const CCTool = new CCToolkit();

// var PleaseWaitDialog = new PleaseWaitDialog();
// var ConnectionDialog = new ConnectionDialog();

function PleaseWaitDialog() {
  var progressTimer;
  var progress = 0;
  var _cancelCallback;

  this.show = function (cancelCallback) {
    _cancelCallback = cancelCallback;
    disableUI();
    $('#divPleaseWait').show();
    var self = this;
    this.progressTimer = window.setInterval(function () {
      updateProgress.call(self);
    }, 500);
    this.progress = 0;
    if (_cancelCallback != null) {
      $('#btnCancel').show();
    } else {
      $('#btnCancel').hide();
    }
  };

  this.hide = function () {
    window.clearInterval(progressTimer);
    this.progressTimer = null;
    enableUI();
    $('#divPleaseWait').hide();
  };

  this.onCancelClick = function () {
    _cancelCallback();
  };

  var updateProgress = function () {
    this.progress += 1;
    var width = Math.ceil((this.progress / 20) * 300);
    $('#divPlsWaitProgress').html(
      '<div style="width:' + width + 'px; background-color:green;height:100%;">&nbsp;</div>',
    );
    if (this.progress >= 20) this.progress = 0;
  };
}

function ConnectionDialog() {
  this.show = function (connection) {
    this.connectionCallback = connection;
    $('#divSelectConnectionDialog').show();
  };

  this.hide = function () {
    $('#divSelectConnectionDialog').hide();
  };

  this.onConnectionSelect = function () {
    this.connectionCallback($('#inputConnection').val());
    this.hide();
  };

  this.onConnectionClose = function () {
    this.hide();
  };
}

export default class NetworkError {
  constructor(conCallback) {
    this.connectionCallback = conCallback;
  }

  show() {
    const messageError = document.querySelector('#lblNetworkError');
    const installTool = document.querySelector('#lnkInstallToolkit');
    const divError = document.querySelector('#divNetworkError');
    if (CCTool.isRemoteSSL()) {
      messageError.innerHTML = 'You are connecting to remote CCT using SSL.<br/>';
      // $('#lblNetworkError').html('You are connecting to remote CCT using SSL.<br/>');
      const cctInstallation = CCTool.createServiceURL('https://', 49735, false) + 'getstatus';
      // $('#lnkInstallToolkit').html(cctInstallation).attr('href', cctInstallation);
      installTool.innerHTML = cctInstallation;
      installTool.setAttribute('href', cctInstallation);
      // $('#lnkInstallToolkit').text('Please follow this link and install SSL certificate.');
    } else {
      let toolkitSource = window.location.href;
      let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if (isMac) {
        toolkitSource =
          toolkitSource.substring(0, toolkitSource.lastIndexOf('/') + 1) + 'PixToolsForWeb.dmg';
      } else {
        toolkitSource =
          toolkitSource.substring(0, toolkitSource.lastIndexOf('/') + 1) + 'setup.exe';
      }
      // $('#lblNetworkError').html(
      //   'PixTools for Web was not found on the computer. Please either reconnect to another computer or download and install it following link below.<br/>',
      // );
      messageError.innerHTML =
        'PixTools for Web was not found on the computer. Please either reconnect to another computer or download and install it following link below.<br/>';

      // $('#lnkInstallToolkit').html('Click here').attr('href', toolkitSource);
      installTool.innerHTML = 'Click here';
      // installTool.setAttribute('href', toolkitSource);
    }

    // $('#divNetworkError').show();
    divError.style.display = 'block';
  }

  hide() {
    // $('#divNetworkError').hide();
    const divError = document.querySelector('#divNetworkError');
    divError.style.display = 'none';
  }

  onReconnect = function () {
    connectionCallback($('#inputReconnection').val());
    hide();
  };
}
