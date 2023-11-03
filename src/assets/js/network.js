import axios from 'axios';
import CCToolkit from './WebToolkit';
import NetworkError from './Dialogs';
import { ISISWebErrorCode, Tags } from './enums';
const CCTool = new CCToolkit();
const networkErrorClass = new NetworkError();

function getDefaultRequest(url = '') {
  return axios({
    method: 'get',
    contentType: 'application/json; charset=utf-8',
    cache: false,
    url: url,
    // error: networkErrorCallback,
  });
}
export function initNetwork() {
  const connection = getSearchParam('ccthost');
  connectRemote(connection);
}

function getSearchParam(k) {
  const p = {};
  location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
    p[k] = v;
  });
  return k ? p[k] : p;
}

function disableUI() {
  // const hideBackground = document.querySelector('#divBackground');
  // hideBackground.classList.add('show');
  // $('#divBackground').show();
  // $('#divBackground').focus();
}

function connectRemote(selectedRemote) {
  if (
    selectedRemote == null ||
    selectedRemote === 'undefined' ||
    selectedRemote === 'local' ||
    selectedRemote === ''
  ) {
    selectedRemote = '127.0.0.1';
  }
  const jQueryAjax = () => {};
  //   $('#lblConnection').text(selectedRemote);

  CCTool.setup(selectedRemote, jQueryAjax, displayNetworkError);
  createSession();
}

function displayNetworkError() {
  // disableUI();
  // const networkError = document.querySelector('#divNetworkError');
  // networkError.classList.add = 'show';
  // networkErrorClass.show();
}
function createSession() {
  disableUI();
  var params = getCreateSessionParams();

  //   PleaseWaitDialog.show(function () {
  //     PleaseWaitDialog.hide();
  //   });

  createSessionIfNeed(params);
}
function createSessionIfNeed(params) {
  var checkExistingSession = true;

  if (checkExistingSession) {
    // check if there is valid CCT session and it is saved in web browser local storage for this web site
    CCTool.existSession(function (data, sessionId) {
      // if toolkit is in invalid state then it is mostly like another CCT session is running so ask user if he would like to continue dropping all existing data in CCT
      if (data != null && data.Status == -28) {
        // showContinueCreateSessionDialog();
      } else {
        // If there is no valid previous session then create it
        if (sessionId === '') {
          continueCreateSession(params);
        } else {
          // UpdateSessionStatus('already exists');
          createSessionCallback(data);
        }
      }
    }, createSessionErrorCallback);
  } else {
    continueCreateSession(params);
  }
}

function getCreateSessionParams() {
  var params = {
    licenseId: 'Some_license',
    applicationId: 'SampleApplication',
    closeExistingSessions: true,
    locale: 'en-us',
    warnDisableOption: 0,
  };
  params.domain = '.';
  params.login = 'minh';
  // if ($('#inputLogin').val()) {
  //   $('#divLogin').hide();

  //   var loginString = $('#inputLogin').val() + '';
  //   params.domain = '.';
  //   params.login = loginString;

  //   if (loginString.indexOf('\\') != -1) {
  //     params.domain = loginString.split('\\')[0];
  //     params.login = loginString.split('\\')[1];
  //   }

  //   params.password = $('#inputPassword').val();
  // }

  return params;
}
function continueCreateSession(params) {
  // closeError();
  // PleaseWaitDialog.show(function () {
  //   PleaseWaitDialog.hide();
  // });

  if (params == null || params === 'undefined') {
    params = getCreateSessionParams();
  }
  // try to create session without credentials, it will work for case when only one used is logged in a system
  params.useIWA = false;
  // UpdateSessionStatus('created');
  CCTool.createSession(params, createSessionCallback, function (data) {
    // if authentication required (for case when there are several uses logged in a system)
    if (data.code === 'ERR_NETWORK') {
      // if you don't want to use IWA then set this parameter to false and sample login dialog will be shown

      params.useIWA = false;

      if (params.useIWA) {
        // if web browser is not configured to pass credentials for IWA then login dialog will be shown by web browser

        CCTool.createSession(params, createSessionCallback, createSessionErrorCallback);
      } else {
        // if there is credentials then call createSession with credentials othewise IWA (integrated windows authentication) can be used
        createSessionErrorCallback(data);
      }
    } else {
      createSessionErrorCallback(data);
    }
  });
}

function createSessionCallback(data) {
  CCTool.fillFiltersList();
}
function createSessionErrorCallback(data) {
  if (data.code === 'ERR_NETWORK') {
    displayNetworkError();
  }
}

function enableUI() {
  // const hideBackground = document.querySelector('#divBackground');
  // hideBackground.classList.remove('show');
}

export function onLoadScannerClick(callback) {
  disableUI();
  // PleaseWaitDialog.show();
  CCTool.getScanners(getScannersCallback, callback);
}
export function getScannersCallback(data) {}

export function onScannerSelect(value, callback) {
  // var scanner = $('#lstScanners').val();
  // $('#divSelectScannerDialog').hide();
  // PleaseWaitDialog.show();
  CCTool.loadScannerByName(value, onScannerLoaded, callback);
}

function onScannerLoaded(data) {
  // enableUI();
  // PleaseWaitDialog.hide();

  // if (isErrorExist(data)) {
  //   displayError(data);
  //   setupUI();
  //   return;
  // }

  // $('#divScannerSettings :input').each(function (idx, el) {
  //   el.disabled = '';
  // });
  // $('#divScannerSettings a').each(function (idx, el) {
  //   el.disabled = '';
  // });

  // hideDetailsPanel();

  // $('#divScanProgress').show();
  // $('#btnSelectScanner').text('Change selected scanner...');
  // showScannerInfo(data);
  // showThumbnails();
  // showDetailsPanel();
  configureEndorserTab();
  // $('#btnSendAllToServer').hide();

  loadScannerSettings();
}
function configureEndorserTab() {
  CCTool.getTag(Tags.TAG_ENDORSER_STRING, 0, function (data) {
    if (data.Status == ISISWebErrorCode.TagNotFoundError) {
      // document.getElementById('tabEndorser').style.display = 'none';
      // document.getElementById('btnTabEndorser').style.display = 'none';
      // $('#tabEndorser').hide();
    } else {
      //document.getElementById("tabEndorser").style.display = "block";
      // document.getElementById('btnTabEndorser').style.display = 'block';
      // $('#divContentViewTab').show();
      document.getElementById('btnTabEndorser').dispatchEvent(
        new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: false,
        }),
      );
    }
  });
}
function loadScannerSettings() {
  // $('#divScannerSettings select').html('').attr('disabled', 'disabled');
  CCTool.getTag(Tags.TAG_PAGESIZE, 0, getTagCallback);
  CCTool.getTag(Tags.TAG_SCANTYPE, 0, getTagCallback);
  CCTool.getTag(Tags.TAG_XRESOLUTION, 0, getTagCallback);
  CCTool.getTag(Tags.TAG_MODE_COMBO, 0, getTagCallback);
  CCTool.getTag(Tags.TAG_ENDORSER_STRING, 0, getTagEndorserStringCallback);
}
// CCTool.getTag(Tags.TAG_PAGESIZE, 0, getTagCallback, callback);
// CCTool.getTag(Tags.TAG_SCANTYPE, 0, getTagCallback, callback);
// CCTool.getTag(Tags.TAG_XRESOLUTION, 0, getTagCallback, callback);
// CCTool.getTag(Tags.TAG_MODE_COMBO, 0, getTagCallback, callback);
// CCTool.getTag(Tags.TAG_ENDORSER_STRING, 0, getTagEndorserStringCallback, callback);
export const getDataTags = (callback) => {
  CCTool.getTag(Tags.TAG_PAGESIZE, 0, callback);
  CCTool.getTag(Tags.TAG_SCANTYPE, 0, callback);
  CCTool.getTag(Tags.TAG_XRESOLUTION, 0, callback);
  CCTool.getTag(Tags.TAG_MODE_COMBO, 0, callback);
};
function getTagCallback(data) {
  // if (data.TagID === Tags.TAG_PAGESIZE) {
  //   populatePageSize(data);
  // }
  // else if (data.TagID === Tags.TAG_XRESOLUTION) {
  //   populateResolution(data);
  // } else if (data.TagID === Tags.TAG_SCANTYPE) {
  //   populateScanType(data);
  // } else if (data.TagID === Tags.TAG_MODE_COMBO) {
  //   populateColorFormats(data);
  // }
  return data;
}

function getTagEndorserStringCallback(data) {}

function populatePageSize(data) {
  if (data.Choices && data.Choices.ChoiceKind == 2 && data.Choices.StringList) {
    var optHtml = '';
    for (var i = 0; i < data.Choices.StringList.length; i++) {
      optHtml +=
        '<option value="' +
        data.Choices.StringList[i] +
        '">' +
        data.Choices.StringList[i] +
        '</option>';
    }
    $('#lstPaperSize').html(optHtml).attr('disabled', '');

    setComboValue('#lstPaperSize', data.Value.StringValue);
  }
}
export function getResolutionItems(choices) {
  var items = [];
  for (var i = choices.MinValue; i <= choices.MaxValue; ) {
    items.push(i);

    if (choices.StepValue == 1 && i < 300) {
      i += 25;
    } else if (choices.StepValue == 1 && i >= 300) {
      i += 50;
    } else {
      i += choices.StepValue;
    }
  }

  return items;
}
export function onScanClick(callback) {
  CCTool.startScanning(onScanStarted, onNewPageAdded, onJobFinished, callback);
}
function onJobFinished(data, document) {
  uploadComplete(data.ScanJobID, document);
}
function uploadComplete(jobID, document) {}

function onScanStarted(data) {}
function onNewPageAdded(data, page) {
  addImageToGallery(page);
}

function addImageToGallery(page) {
  const imageUrl = page.getCurrent() ? page.getCurrent(100, 0) : page?.getOriginal(100, 0);

  const imageNumber = page.getPageNumber();
  const div =
    '<div pagenumber="' +
    imageNumber +
    '" id="divThumb' +
    imageNumber +
    '" className=thumb-item><img src="' +
    imageUrl +
    '" alt="Image number: ' +
    imageNumber +
    '" onclick="showPage(' +
    imageNumber +
    ')" ></img>' +
    'Page ' +
    imageNumber +
    '</div>';

  const divList = document.querySelector('#thumbList');
}

export function showPage(imageNumber, callback) {
  // PleaseWaitDialog.show();
  showImageDetails(imageNumber, callback);
  const filters = CCTool.getDocument().getPage(imageNumber).getFilters();
  // IpUiManager.configureFiltersUI(filters);
  // selectPageThumbnail(imageNumber);
}

function showImageDetails(imageNumber, callback) {
  const document = CCTool.getDocument();
  const page = document.getPage(imageNumber);
  page.getImageInfo(showImageDetailsCallback, callback);
}
function showImageDetailsCallback(page, data) {
  showImageDetailsCallbackInternal(page, data);
  // PleaseWaitDialog.hide();
}
function showImageDetailsCallbackInternal(page, data) {
  // if (isErrorExist(data)) {
  //   displayError(data);
  //   return;
  // }

  // window.CurrentImage = data.ImageNumber;
  // const filters = page.getFilters();

  // if (filters == undefined) {
  //   setRotation(0);
  // } else {
  //   var rot = getFilterProperty(page.getFilters().Filters, 'transformation', 'rotation');
  //   setRotation(rot == undefined || rot == 8 ? 0 : rot);
  // }
  // web browsers cannot show large images hence request scaled copy of the image
  const width = 0;
  const height = 0;
  const maxSize = 4000;
  if (data.ImageInfo.Width > maxSize || data.ImageInfo.height > maxSize) {
    if (data.ImageInfo.Width > data.ImageInfo.height) {
      width = maxSize;
    } else {
      height = maxSize;
    }
  }
  const urlImage = page.getCurrent(width, height) + getAnnotation();
  // $('#imgDetails').attr('src', page.getCurrent(width, height) + getAnnotation());
  // $("#imgDetails").show();
  // $('#divImageTools').show();

  // showImageInfo(data, page);
  // updateImageInGallery(page);
  // updateAnnotationInformation(page);
  // updateFilterContent(page);
  // $('#divContentViewTab').show();
  // document.getElementById('btnTabImage').style.display = 'block';
  // document.getElementById('btnTabImageInfo').style.display = 'block';
  // document.getElementById('btnTabAnnotations').style.display = 'block';
  // document.getElementById('btnTabFilters').style.display = 'block';
  // $('#imgDetails').show();

  // IE 11 doesn't support MouseEvent constructor, using createEvent
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#Browser_compatibility
  // var event = null;
  // if (document.documentMode == 11) {
  //   event = document.createEvent('MouseEvent');
  //   event.initMouseEvent(
  //     'click',
  //     true,
  //     false,
  //     window,
  //     0,
  //     0,
  //     0,
  //     0,
  //     0,
  //     false,
  //     false,
  //     false,
  //     false,
  //     0,
  //     null,
  //   );
  // } // all other browsers
  // else {
  //   event = new MouseEvent('click', {
  //     view: window,
  //     bubbles: true,
  //     cancelable: false,
  //   });
  // }
  // if (event != null) {
  //   // select the Image tab each time an image is imported.
  //   document.getElementById('btnTabImage').dispatchEvent(event);
  // }
}

export function getAnnotation() {
  return '&annotations=' + (isButtonSelected('checkannotations') ? 'all' : 'none');
}

function isButtonSelected(buttonId) {
  // if ($("#" + buttonId).length) {
  //     if ($("#" + buttonId).hasClass("menu-button")) {
  //         return false;
  //     }

  //     return true;
  // }

  return false;
}

export function onPaperSizeChanged(value) {
  CCTool.setTagStringValue(Tags.TAG_PAGESIZE, value, setTagCallback);
}

export function onColorFormatChanged(colorFormat) {
  CCTool.setTagIntegerValue(Tags.TAG_MODE_COMBO, colorFormat, 0, setTagCallback);
}

export function onResolutionChanged(value) {
  CCTool.setTagRationalValue(Tags.TAG_XRESOLUTION, value, 1, 0, setTagCallback);
}

export function onScanModeChanged(value) {
  CCTool.setTagIntegerValue(Tags.TAG_SCANTYPE, value, 0, setTagCallback);
}
function setTagCallback(data) {
  // if (isErrorExist(data)) {
  //   displayError(data);
  //   return;
  // }
}
