import axios from 'axios';
import { FileType, ISISWebErrorCode, ImageCompression, TaskStatus } from './enums';
import { bind } from 'lodash';

// const netWork = new NetworkError();
let networkErrorCallback;
let ajaxRequest;
// var CCToolkit = new CCToolkit();

// function getDefaultRequest() {
//   return {
//     type: 'GET',
//     contentType: 'application/json; charset=utf-8',
//     dataType: 'jsonp',
//     jsonp: 'method',
//     timeout: 30000,
//     cache: false,
//     url: '',
//     error: networkErrorCallback,
//     success: null,
//   };
// }
async function getDefaultRequest(url = '', headers = {}) {
  let api;
  try {
    api = await axios({
      method: 'get',
      contentType: 'application/json; charset=utf-8',
      cache: false,
      mode: 'no-cors',
      url: url,
      timeout: 30000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': true,
        ...headers,
      },

      // error: networkErrorCallback,
    });
  } catch (error) {
    console.log(error);
  } finally {
    return api;
  }
}
async function getDefaultPostRequest(url = '', headers = {}, body = {}) {
  // return {
  //   type: 'POST',
  //   contentType: 'application/json; charset=utf-8',
  //   dataType: 'json',
  //   crossDomain: true,
  //   jsonp: null,
  //   timeout: 30000,
  //   cache: false,
  //   url: '',
  //   data: null,
  //   processData: false,
  //   error: networkErrorCallback,
  //   success: null,
  // };
  try {
    return await axios({
      method: 'post',
      contentType: 'application/json; charset=utf-8',
      cache: false,
      url: url,
      timeout: 30000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...headers,
      },
      data: body,

      // error: networkErrorCallback,
    });
  } catch (error) {
    console.log(error);
  }
}

function AsyncOperation(service, session, request, progressCallback, finishedCallback, finish) {
  var _serviceUrl = service;
  var _sessionId = session;
  var self = this;
  request.then((res) => {
    const data = res.data;
    _asynOperationcCallback(data, progressCallback, finishedCallback, finish);
  });
  // ajaxRequest(request);

  const _asynOperationcCallback = (data, pCallback, callback, finish) => {
    var self = this;
    if (data.Status === 0 && data.StatusCode === TaskStatus.InProgress) {
      setTimeout(function () {
        _pollSession(data.TokenID, pCallback, callback, finish);
      }, 1000);
    } else {
      callback(data);
      finish(data);
    }
  };

  const _pollSession = (tokenID, progressCallback, finishedCallback, finish) => {
    const pollSessionCallback = (data) => {
      if (data.Status == 0 && data.StatusCode == TaskStatus.InProgress) {
        if (progressCallback) {
          progressCallback(data);
        }
        window.setTimeout(function () {
          _pollSession(data.TokenID, progressCallback, finishedCallback, finish);
        }, 1000);
      } else {
        finishedCallback(data);
        finish(data);
      }
    };
    let interval;
    const sessionId = localStorage.getItem('cct_session_id') || null;
    const url = _serviceUrl + 'getstatus?session=' + sessionId + '&tokenid=' + tokenID;
    const request = getDefaultRequest(url, {});
    request.then((res) => {
      const data = res?.data;
      console.log(data);
      // interval = setInterval(function () {
      pollSessionCallback(data);
      finish(data);
      // }, 1000);
    });
    // ajaxRequest(request);
  };
}
var _host = '127.0.0.1';
var _baseServicePath = '/scanservice';
var _servicePath = _baseServicePath + '/v2/';
var _authServicePath = _baseServicePath + '/v2/auth/';
var _cctSessionIdKey = 'cct_session_id';
var _httpPortNumbers = [49732, 49733, 49734];
var _httpsPortNumbers = [49735, 49736, 49737];
let _serviceURL = '';
let _authServiceURL = '';
var _sessionID = null;
var _scanJob = null;
let _scanStartedCallback = null;
var _pageScannedCallback = null;
let _scanFinishedCallback = null;
let finishScan = null;
var _document = null;

var _filters = [];

export default class CCToolkit {
  //initialize private fields
  //initialize public members
  getServiceHost = function () {
    return _host;
  };

  getServiceUrl = function () {
    return _serviceURL;
  };

  getSessionId = function () {
    return _sessionID;
  };

  getDocument = function () {
    return _document;
  };

  getFilters = function () {
    return _filters;
  };

  setup(cctHost, ajaxMethod, networkError) {
    if (cctHost != null && cctHost !== 'undefined') _host = cctHost;
    networkErrorCallback = networkError;
    ajaxRequest = ajaxMethod;
  }

  isRemoteSSL = function () {
    return (
      window.location.href.toLowerCase().indexOf('https') === 0 && _host.indexOf('127.0.0.1') < 0
    );
  };

  createServiceURL(protocol, portNumber, auth) {
    const servicePath = auth === true ? _authServicePath : _servicePath;
    return protocol + _host + ':' + portNumber + servicePath;
  }

  loadScanner = function (params, callback) {
    var request = getDefaultRequest();
    request.url =
      _serviceURL +
      'loadscanner?session=' +
      _sessionID +
      '&loadscanneroption=' +
      params.loadScannerOption;
    AsyncOperation(_serviceURL, _sessionID, request, function () {}, callback);
  };

  getScanners(callback, finish) {
    const sessionId = localStorage.getItem('cct_session_id') || null;
    const url = _serviceURL + 'getscannerlist?session=' + sessionId;
    const request = getDefaultRequest(url, {});
    AsyncOperation(_serviceURL, sessionId, request, function () {}, callback, finish);
  }

  getScannerSettings = function (callback) {
    var request = getDefaultRequest();
    request.url = _serviceURL + 'getscannersettings?session=' + _sessionID;
    request.success = callback;
    ajaxRequest(request);
  };

  setScannerSettings = function (state, callback) {
    _setScannerSettings.call(this, -1, state, callback);
  };

  loadScannerByName(scannerName, callback, finish) {
    const sessionId = localStorage.getItem('cct_session_id') || null;
    const url =
      _serviceURL + 'loadscannerbyname?session=' + sessionId + '&scannername=' + scannerName;
    const request = getDefaultRequest(url, {});
    AsyncOperation(_serviceURL, sessionId, request, function () {}, callback, finish);
  }

  endSession = function () {
    if (_sessionID) {
      var request = getDefaultRequest();
      request.url = _serviceURL + 'endsession?session=' + _sessionID;
      request.success = function () {};
      ajaxRequest(request);
    }
  };

  unloadScanner = function (callback) {
    var request = getDefaultRequest();
    request.url = _serviceURL + 'unloadscanner?session=' + _sessionID;
    request.success = callback;
    ajaxRequest(request);
  };

  showScannerConfigurationDialog = function (callback) {
    var request = getDefaultRequest();
    request.url = _serviceURL + 'showscannerui?session=' + _sessionID;
    AsyncOperation(_serviceURL, _sessionID, request, function () {}, callback);
  };

  existSession(callback, errorCallback) {
    var self = this;
    // check if localStorage object is valid
    // localStorage throws an exception in Edge 44.18362.449.0
    // and it is undefined in IE 11
    var storage = null;
    var localSt = null;
    try {
      storage = typeof Storage;
      localSt = typeof window.localStorage;
    } catch (e) {}
    if (storage !== 'undefined' && localSt !== 'undefined' && localSt !== null) {
      var lastSessionId = localStorage.getItem('cct_session_id');
      if (lastSessionId == null || lastSessionId == 'undefined') {
        callback(null, '');
      } else {
        _sessionID = lastSessionId;
        this.discoverService(function () {
          // CCT service has been found so check if saved session still exists
          this._getStatus(
            _sessionID,
            '123',
            function (data) {
              // if invalid token error (-20 ) is returned then session exists so don't need to create new one
              if (data.Status == -20) {
                data.Status = 0;
                callback(data, _sessionID);
              } else {
                _sessionID = null;
                callback(data, '');
              }
            },
            errorCallback,
          );
        }, errorCallback);
      }
    } else {
      callback(null, '');
    }
  }

  createSession(params, callback, errorCallback) {
    if (!_serviceURL) {
      this.discoverService(this._createSession(params, callback, errorCallback), errorCallback);
    } else {
      this._createSession(params, callback, errorCallback);
    }
  }

  startScanning(scanStartedCallback, pageScannedCallback, scanFinishedCallback, callback) {
    _scanStartedCallback = scanStartedCallback;
    _pageScannedCallback = pageScannedCallback;
    _scanFinishedCallback = scanFinishedCallback;
    // _importing = false;
    finishScan = callback;
    const url =
      _serviceURL +
      'createscanjob?session=' +
      _sessionID +
      '&pages=' +
      0 +
      '&filetype=' +
      FileType.AutoDetect +
      '&compression=' +
      ImageCompression.AutoDetect;
    const request = getDefaultRequest(url, {});

    request.then((res) => {
      const data = res.data;
      this._onScanStarted(data, false);
    });
    // ajaxRequest(request);
  }

  startImporting = function (
    fileContent,
    scanStartedCallback,
    pageScannedCallback,
    scanFinishedCallback,
  ) {
    _scanStartedCallback = scanStartedCallback;
    _pageScannedCallback = pageScannedCallback;
    _scanFinishedCallback = scanFinishedCallback;
    _importing = true;
    var request = getDefaultPostRequest();
    request.url = _serviceURL + 'createimportjob?session=' + _sessionID;
    request.data = JSON.stringify({ FileData: fileContent, PageSplitting: true });
    request.success = function (data) {
      _onScanStarted(data, true);
    };
    ajaxRequest(request);
  };

  stopScanning = function (callback) {
    var request = getDefaultRequest();
    request.url = _serviceURL + 'stopscanning?scanjob=' + _scanJob.ScanJobID;
    request.success = callback;
    ajaxRequest(request);
  };

  stopImporting = function (callback) {
    stopScanning(callback);
  };

  getTag(tagID, index, callback) {
    const sessionId = localStorage.getItem('cct_session_id') || null;
    const url = _serviceURL + 'gettag?session=' + sessionId + '&tagid=' + tagID + '&index=' + index;
    const request = getDefaultRequest(url, {});

    request.then((res) => {
      const data = res.data;
      callback(data);
    });
    // ajaxRequest(request);
  }

  setTagStringValue(tagID, value, callback) {
    const sessionId = localStorage.getItem('cct_session_id');
    const url =
      _serviceURL +
      'settagstringvalue?session=' +
      _sessionID +
      '&tagid=' +
      tagID +
      '&value=' +
      encodeURIComponent(value);
    const request = getDefaultRequest(url, sessionId);

    request.then((res) => {
      const data = res.data;
      callback(data);
    });
  }

  setTagIntegerValue(tagID, value, index, callback) {
    const sessionId = localStorage.getItem('cct_session_id');
    const url =
      _serviceURL +
      'settagintegervalue?session=' +
      sessionId +
      '&tagid=' +
      tagID +
      '&value=' +
      value +
      '&index=' +
      index;
    index;
    const request = getDefaultRequest(url, {});

    request.then((res) => {
      const data = res.data;
      callback(data);
    });
  }

  setTagRationalValue(tagID, numerator, denominator, index, callback) {
    const sessionId = localStorage.getItem('cct_session_id');
    const url =
      _serviceURL +
      'settagrationalvalue?session=' +
      sessionId +
      '&tagid=' +
      tagID +
      '&numerator=' +
      numerator +
      '&denominator=' +
      denominator +
      '&index=' +
      index;
    const request = getDefaultRequest(url, {});

    request.then((res) => {
      const data = res.data;
      callback(data);
    });
  }

  getImageURL = function (imageNumber, params) {
    return (
      _serviceURL +
      'image/' +
      params.scanJobID +
      '/' +
      imageNumber +
      '?' +
      'filetype=' +
      params.filetype +
      '&compression=' +
      params.compression +
      '&rotation=' +
      params.rotation +
      '&brightness=' +
      params.brightness +
      '&contrast=' +
      params.contrast +
      '&width=' +
      params.width +
      '&height=' +
      params.height
    );
  };

  discoverService(successCallback, errorCallback) {
    const serviceURLs = this._getServiceURLs();
    var maxAttemptsNumber = serviceURLs.length;
    var failedAttemptsNumber = 0;
    for (let i = 0; i < maxAttemptsNumber; i++) {
      this._checkServiceURL(serviceURLs[i], successCallback, checkServiceURLError);
    }

    function checkServiceURLError(data) {
      failedAttemptsNumber += 1;
      console.log(data);
      if (failedAttemptsNumber === maxAttemptsNumber) {
        errorCallback(data);
      }
    }
  }

  checkUpdate = function (callback) {
    var request = getDefaultPostRequest();
    request.url = _serviceURL + 'checkupdate?session=' + _sessionID;
    request.data = JSON.stringify({ Url: null });
    request.success = callback;
    ajaxRequest(request);
  };

  prepareUpdate = function (callback, progressCallback) {
    var request = getDefaultPostRequest();
    request.url = _serviceURL + 'prepareupdate?session=' + _sessionID;
    request.data = JSON.stringify({ Url: null });
    AsyncOperation(_serviceURL, _sessionID, request, progressCallback, callback);
  };

  startUpdate = function (prepareToken, callback) {
    var request = getDefaultPostRequest();
    request.url = _serviceURL + 'startupdate?session=' + _sessionID;
    request.data = JSON.stringify({ TokenID: prepareToken });
    request.success = callback;
    ajaxRequest(request);
  };

  fillFiltersList(callback) {
    const url = _serviceURL + _sessionID + '/filters';
    const request = getDefaultRequest(url, {});
    request.then((res) => {
      const data = res.data;
      const filters = data.FilterSettings.Filters;
      filters.forEach(function (filter) {
        _filters.push(filter.Name);
      });
    });

    ajaxRequest(request);
  }

  //Begin private methods
  _setScanJob(scanJob) {
    _scanJob = {
      ScanJobID: scanJob.ScanJobID,
      TokenID: scanJob.TokenID,
      NumberOfScannedImages: scanJob.NumberOfScannedImages,
      NumberOfReceivedImages: 0,
      IsInImageLoading: false,
    };
  }

  _onScanStarted(data, importing) {
    //set scan job
    this._setScanJob(data);
    const sessionId = localStorage.getItem('cct_session_id') || null;
    _document = new Document(_serviceURL, sessionId, _scanJob.ScanJobID, importing);
    //check job progress
    this._pollScanner();
    if (_scanStartedCallback) {
      _scanStartedCallback(data);
    }
  }

  _getStatus(sessionId, tokenId, callback, errorCallback) {
    const url = _serviceURL + 'getstatus?session=' + sessionId + '&tokenid=' + tokenId;
    const request = getDefaultRequest(url, {});
    request.then((res) => {
      const data = res.data;
      callback(data);
    });
    if (errorCallback != null) {
      request.catch((res) => {
        const data = res.data;
        callback(data);
      });
    }
    // ajaxRequest(request);
  }

  _pollScanner = function () {
    const sessionId = localStorage.getItem('cct_session_id') || null;
    this._getStatus(sessionId, _scanJob.TokenID, this._pollScannerCallback.bind(this));
  };

  _pollScannerCallback = function (data) {
    if (
      data.Status === 0 ||
      data.Status === ISISWebErrorCode.ScanCancelError ||
      data.Status === ISISWebErrorCode.InvalidLicenseScanRestriction
    ) {
      _scanJob.NumberOfScannedImages = data.NumberOfScannedImages;
      if (_scanJob.NumberOfScannedImages > _scanJob.NumberOfReceivedImages) {
        for (let i = _scanJob.NumberOfReceivedImages; i < _scanJob.NumberOfScannedImages; i++) {
          const page = new Page(_serviceURL, _sessionID, _scanJob.ScanJobID, i, null, null);
          _document.add(page);
          _pageScannedCallback(data, page);
          finishScan(data, page);
          _scanJob.NumberOfReceivedImages++;
        }
      }
    }

    if (data.Status === 0 && data.StatusCode === TaskStatus.InProgress) {
      window.setTimeout(
        function () {
          this._pollScanner();
        }.bind(this),
        1000,
      );
    } else {
      _scanFinishedCallback(data, _document);
      finishScan(_document);
    }
  };

  _getServiceURLs() {
    var address = window.location.href;
    var protocol = address.indexOf('https') === 0 ? 'https://' : 'http://';
    var portNumbers = protocol === 'https://' ? _httpsPortNumbers : _httpPortNumbers;
    var serviceURLs = [];
    for (var i = 0; i < portNumbers.length; i++) {
      var serviceURL = this.createServiceURL(protocol, portNumbers[i], false);
      var authServiceURL = this.createServiceURL(protocol, portNumbers[i], true);
      serviceURLs.push({
        serviceURL: serviceURL,
        authServiceURL: authServiceURL,
        testURL: serviceURL + 'getstatus',
      });
    }
    return serviceURLs;
  }

  _checkServiceURL(url, successCallback, errorCallback) {
    const request = getDefaultRequest(url.testURL, {});

    request
      .then((res) => {
        const data = res.data;
        _authServiceURL = url.authServiceURL;
        _serviceURL = url.serviceURL;
        successCallback(data);
      })
      .catch((err) => {
        errorCallback(err);
      });
    // ajaxRequest(request);
  }

  getBase64Login(domain, login, pass) {
    return btoa(domain + ':' + login + ':' + pass);
  }

  _createSession(params, callback, errorCallback) {
    // const request = getDefaultRequest();
    let header;
    if (params.useIWA == 'undefined') {
      params.useIWA = false;
    }

    if (params.login != undefined && params.password != undefined && params.useIWA == false) {
      // request.beforeSend = function (req) {
      header = 'Basic ' + getBase64Login(params.domain, params.login, params.password);
      // req.setRequestHeader('Authorization', header);
      // };
    }

    let serviceURL;
    // use JSONP for IWA because otherwise preflight OPTION requests gets Unauthorized response which stops negotiation
    if (params.useIWA) {
      serviceURL = _authServiceURL;
    } else {
      serviceURL = _serviceURL;
    }
    const url =
      serviceURL +
      'createsession?license=' +
      params.licenseId +
      '&app=' +
      params.applicationId +
      '&closeexisting=' +
      params.closeExistingSessions +
      '&locale=' +
      params.locale +
      '&timeout=' +
      0 +
      '&warndisableoption=' +
      params.warnDisableOption;
    const request = getDefaultRequest(url, { headers: { Authorization: header } });
    request
      .then((res) => {
        const data = res.data;
        if (data.SessionID && data.SessionID.length) {
          _sessionID = data.SessionID;
          // check if localStorage object is valid
          // localStorage throws an exception in Edge 44.18362.449.0
          // and it is undefined in IE 11
          var storage = null;
          var localSt = null;
          try {
            storage = typeof Storage;
            localSt = typeof window.localStorage;
          } catch (e) {}
          if (storage !== 'undefined' && localSt !== 'undefined' && localSt !== null) {
            window.localStorage.setItem(_cctSessionIdKey, _sessionID);
          }
        }
        callback(data);
      })
      .catch(errorCallback);

    // request.error = errorCallback;
    // ajaxRequest(request);
  }

  _setScannerSettings = function (index, state, callback) {
    var request = getDefaultRequest();

    var opt = index == -1 ? 0 : 1;
    var maxLength = 500;
    var lastIndex = index == -1 ? 0 : index + maxLength;
    if (state.length - index < maxLength) {
      opt = 2;
      lastIndex = state.length;
    }

    var subState = state.substring(index, lastIndex);
    request.url =
      _serviceURL +
      'setscannersettings?session=' +
      _sessionID +
      '&option=' +
      opt +
      '&settings=' +
      encodeURIComponent(subState);
    request.success = function () {
      if (lastIndex == state.length) {
        callback();
      } else {
        _setScannerSettings(lastIndex, state, callback);
      }
    };

    ajaxRequest(request);
  };

  //End private methods
}

class Document {
  constructor(serviceUrl, sessionId, jobId, importing) {
    this._serviceUrl = serviceUrl;
    this._sessionId = sessionId;
    this._jobId = serviceUrl;
    this._importing = importing;
    this._serviceUrl = serviceUrl;
  }
  // var _serviceUrl = serviceUrl;
  // var _sessionId = sessionId;
  // var _jobId = jobId;
  // var _importing = importing;
  // var _enhancePageNumber = -1;
  // var _pageProcessedCallback = null;
  // var _finishedProcessingCallback = null;

  pages = [];
  add = function (page) {
    this.pages.push(page);
  };

  getImportedFile() {
    let res = null;
    if (this._importing) {
      res = _serviceUrl + _sessionId + '/' + _jobId;
    }

    return res;
  }

  getPage(number) {
    return this.pages[number];
  }

  deletePage = function (pageNumber) {
    this.pages.splice(pageNumber, 1);
  };

  insertPage = function (pos, page) {
    this.pages.splice(pos, 1, page);
  };

  save = function (fileType, pageSavedCallback, savingFinishedCallback) {
    if (!this.pages.length) {
      return;
    }

    var idList = '';
    var self = this;
    var pageNumber = 0;
    this.pages[pageNumber].getImageInfo(function (page, data) {
      onImageInfoReceived.call(
        self,
        pageNumber,
        data,
        idList,
        fileType,
        pageSavedCallback,
        savingFinishedCallback,
      );
    });
  };

  addDocument = function (document) {
    for (var i in document.pages) {
      this.pages.push(document.pages[i]);
    }
  };

  enhanceAndAnalize = function (filters, pageProcessedCallback, finishedCallback) {
    var self = this;
    _pageProcessedCallback = pageProcessedCallback;
    _finishedProcessingCallback = finishedCallback;
    _enhancePageNumber = 0;
    this.pages[_enhancePageNumber].enhanceAndAnalize(filters, function (page, data) {
      onPageProcessed.call(self, page, data);
    });
  };

  clonePage = function (pageNumber, clonePageCallback) {
    var page = this.getPage(pageNumber);
    var imageID = page.getCurrentImageID();
    if (!imageID) {
      return;
    }

    var self = this;
    var selfURL = _serviceUrl;
    var selfSessionID = _sessionId;
    var selfJobId = _jobId;

    var request = getDefaultPostRequest();
    request.url = _serviceUrl + _sessionId;
    request.data = JSON.stringify({ Source: imageID, JobID: _jobId });
    request.success = function (data) {
      var page = new Page(selfURL, selfSessionID, selfJobId, data.Target, null, null);
      self.add(page);
      clonePageCallback(page);
    };
    ajaxRequest(request);
  };

  onImageInfoReceived = function (
    pageNumber,
    data,
    idList,
    fileType,
    pageSavedCallback,
    savingFinishedCallback,
  ) {
    var self = this;
    if (pageNumber != 0) {
      idList += ',';
    }

    idList += data.ImageID;

    if (pageNumber == this.pages.length - 1) {
      var request = getDefaultRequest();
      request.url =
        _serviceUrl +
        'getmultipageid?session=' +
        _sessionId +
        '&idlist=' +
        idList +
        '&filetype=' +
        fileType;
      AsyncOperation(_serviceUrl, sessionId, request, pageSavedCallback, savingFinishedCallback);
    } else {
      pageNumber++;
      this.pages[pageNumber].getImageInfo(function (page, data) {
        onImageInfoReceived.call(
          self,
          pageNumber,
          data,
          idList,
          fileType,
          pageSavedCallback,
          savingFinishedCallback,
        );
      });
    }
  };

  onPageProcessed = function (page, data) {
    var self = this;
    _pageProcessedCallback(page, data);
    _enhancePageNumber++;
    if (_enhancePageNumber >= this.pages.length) {
      _finishedProcessingCallback();
    } else {
      this.pages[_enhancePageNumber].enhanceAndAnalize(filters, function (page, data) {
        onPageProcessed.call(self, page, data);
      });
    }
  };
}
let _annotations = null;
let _pageMetadata = null;

class Page {
  constructor(serviceUrl, sessionId, jobId, pageNumber, filters) {
    this._serviceUrl = serviceUrl;
    this._sessionId = sessionId;
    this._jobId = jobId;
    this._pageNumber = pageNumber;
    this._filters = filters;
    // this._annotations = annotations;
  }
  // var _serviceUrl = serviceUrl;
  // var _sessionId = sessionId;
  // var _jobId = jobId;
  // var _pageNumber = pageNumber;
  // var _filters = filters;

  getOriginal(w, h, inputFileFormat, inputCompression) {
    const width = w ? w : 0;
    const height = h ? h : 0;

    const format = !inputFileFormat && inputFileFormat !== 0 ? FileType.Png : inputFileFormat;
    const compression =
      !inputCompression && inputCompression !== 0 ? ImageCompression.AutoDetect : inputCompression;
    return (
      this._serviceUrl +
      'image/' +
      this._jobId +
      '/' +
      this._pageNumber +
      '?converttobinary=false&filetype=' +
      format +
      '&compression=' +
      compression +
      '&rotation=0&brightness=0&contrast=0&width=' +
      width +
      '&height=' +
      height
    );
  }

  getCurrentImageID = function () {
    if (_pageMetadata === null) return null;

    return _pageMetadata.ImageID;
  };

  getCurrent(w, h, inputFileFormat, inputCompression) {
    if (_pageMetadata === null) return null;
    const width = w ? w : 0;
    const height = h ? h : 0;

    const format =
      !inputFileFormat && inputFileFormat !== 0 ? this._getDefaultFileType() : inputFileFormat;
    const compression =
      !inputCompression && inputCompression !== 0
        ? this._getDefaultCompression()
        : inputCompression;
    const sessionId = localStorage.getItem('cct_session_id') || null;
    return (
      this._serviceUrl +
      sessionId +
      '/' +
      this._jobId +
      '/' +
      _pageMetadata.ImageID +
      '?filetype=' +
      format +
      '&compression=' +
      compression +
      '&width=' +
      width +
      '&height=' +
      height
    );
  }

  getImageInfo(callback, newCallback) {
    const self = this;
    // if (_pageMetadata !== null) {
    //   callback(_pageMetadata);
    // } else {
    this.enhanceAndAnalize(IPSettings([]), callback, newCallback);
    // }
  }

  getPageNumber() {
    return this._pageNumber;
  }

  getFilters() {
    return this._filters;
  }

  getAnnotations = function () {
    return _annotations;
  };

  enhanceAndAnalize(filters, callback, newCallback) {
    // var self = this;
    const sessionId = localStorage.getItem('cct_session_id') || null;
    const url = this._serviceUrl + sessionId + '/' + this._jobId + '/' + this._pageNumber;
    const body = filters;

    const request = getDefaultPostRequest(url, {}, body);

    request.then((res) => {
      const data = res.data;
      _pageMetadata = data;
      this._filters = filters;
      _annotations = data.Annotations;
      callback(this, data);
      newCallback(this, data);
    });
    // ajaxRequest(request);
  }

  save = function (filetype, compression, savingFinishedCallback) {
    var filters = _filters;
    if (!filters) {
      filters = IPSettings(null);
    }

    filters.ImageOutput.FileType = filetype;
    filters.ImageOutput.Compression = compression;

    var self = this;
    var request = getDefaultPostRequest();
    request.url = _serviceUrl + _sessionId + '/' + _jobId + '/' + _pageNumber;
    request.data = JSON.stringify(filters);
    request.success = function (data) {
      _pageMetadata = data;
      _filters = filters;
      savingFinishedCallback(self, data);
    };
    ajaxRequest(request);
  };

  /**
   * Makes a GET http request to get the annotations from the current image.
   *
   * @param {requestCallback} callback - the callback to handle the response
   */
  callGetAnnotations = function (callback) {
    var self = this;
    var request = getDefaultRequest();
    request.url = _serviceUrl + _sessionId + '/' + _jobId + '/' + _pageNumber + '/annotations';
    request.dataType = null;
    request.success = function (data) {
      callback(data);
    };
    ajaxRequest(request);
  };

  /**
   * Makes a POST http request to modify the annotations in the current image
   *
   * @param {string} annotations - a Json string representing the new/modified annotaions
   * @param {requestCallback} callbackSuccess - the callback to handle a successful response
   * @param {requestCallback} callbackError - the callbak to handle an error response.
   */
  callModifyAnnotations = function (annotations, callbackSuccess, callbackError) {
    var self = this;
    var request = getDefaultPostRequest();
    request.url = _serviceUrl + _sessionId + '/' + _jobId + '/' + _pageNumber + '/annotations';
    request.data = annotations;
    request.success = function (data) {
      callbackSuccess(data);
    };
    request.error = function (responseData) {
      callbackError(responseData);
    };
    ajaxRequest(request);
  };

  _getDefaultCompression = function () {
    //jpeg for gray and color otherwise png
    return this._isBinary() ? ImageCompression.None : ImageCompression.Jpeg; //png or jpeg compression
  };

  _getDefaultFileType() {
    return this._isBinary() ? FileType.Png : FileType.Jpeg;
  }

  _isBinary() {
    return _pageMetadata.ImageInfo.ColorFormat.BitsPerSample != 8;
  }
}

function IPSettings(filters) {
  return { ImageOutput: { FileType: 0, Compression: 0 }, Filters: filters };
}

function Filter(name, properties) {
  return { Name: name, Properties: properties };
}

function FilterProperty(name, value) {
  return { Name: name, Value: value };
}

function getFilterProperty(filters, filterName, propName) {
  for (var i in filters) {
    if (filters[i].Name.toLowerCase() == filterName.toLowerCase()) {
      for (var y in filters[i].Properties) {
        if (filters[i].Properties[y].Name.toLowerCase() == propName.toLowerCase()) {
          return filters[i].Properties[y].Value;
        }
      }
    }
  }

  return null;
}

function getDefaultFilterProperty(filterName, propName, callback) {
  var request = getDefaultRequest();
  request.url = CCToolkit.getServiceUrl() + CCToolkit.getSessionId() + '/filters';
  request.success = function (data) {
    var filters = data.FilterSettings.Filters;

    var value = getFilterProperty(filters, filterName, propName);
    callback(value);
  };

  ajaxRequest(request);
}

function setFilterProperty(filters, filterName, propName, propValue) {
  for (var i in filters) {
    if (filters[i].Name.toLowerCase() == filterName.toLowerCase()) {
      for (var y in filters[i].Properties) {
        if (filters[i].Properties[y].Name.toLowerCase() == propName.toLowerCase()) {
          filters[i].Properties[y].Value = propValue;
        }
      }
    }
  }
}

function Uploader(
  beginUploadUrl,
  uploadChunkUrl,
  endUploadUrl,
  uploadErrorCallback,
  progressCallback,
  completeCallback,
) {
  var _uploadErrorCallback = uploadErrorCallback;
  var _completeCallback = completeCallback;
  var _progressCallback = progressCallback;
  var _beginUploadUrl = beginUploadUrl;
  var _uploadChunkUrl = uploadChunkUrl;
  var _endUploadUrl = endUploadUrl;

  this.send = function (image) {
    image.Offset = 0;
    if (!image.FileType) {
      if (image.ImageInfo && image.ImageInfo.FileType) {
        image.FileType = image.ImageInfo.FileType;
      } else {
        image.FileType = FileType.Tiff;
      }
    }

    image.ChunkSize = 65536; //64K
    _beginUpload.call(this, image);
  };

  var _beginUpload = function (image) {
    var self = this;
    var request = getDefaultPostRequest();
    request.url = _beginUploadUrl;
    request.error = _uploadErrorCallback;
    request.data = '{ "imageID": "' + image.ImageID + '", "fileType":' + image.FileType + ' }';
    request.success = function (data) {
      _beginUploadCallback.call(self, data, image);
    };
    ajaxRequest(request);
  };

  var _beginUploadCallback = function (data, image) {
    image.UploadID = data.UploadID;
    _getImageDataString.call(this, image);
  };

  var _getImageDataString = function (image) {
    var self = this;
    var request = getDefaultRequest();
    request.url =
      CCToolkit.getServiceUrl() +
      'getimagedatastring?session=' +
      CCToolkit.getSessionId() +
      '&imageID=' +
      image.ImageID +
      '&offset=' +
      image.Offset +
      '&size=' +
      image.ChunkSize +
      '&encoding=' +
      DataEncoding.Base64;
    request.success = function (data) {
      _getImageDataBytesCallback.call(self, data, image);
    };
    ajaxRequest(request);
  };

  var _getImageDataBytesCallback = function (data, image) {
    _sendImageDataBytes.call(this, data, image);
  };

  var _sendImageDataBytes = function (data, image) {
    if (!data.Data || !data.Data.length) {
      _endUpload.call(this, image);
      return;
    }

    var self = this;
    var request = getDefaultPostRequest();
    request.url = _uploadChunkUrl;
    request.error = _uploadErrorCallback;
    request.data =
      '{ "uploadID": "' +
      image.UploadID +
      '", "offset":' +
      image.Offset +
      ', "data":"' +
      data.Data +
      '"}';
    request.success = function () {
      _sendImageDataBytesCallback.call(this, image);
    };
    ajaxRequest(request);
  };

  var _sendImageDataBytesCallback = function (image) {
    _progressCallback.call(this, image.Offset, image.ImageSize);
    image.Offset += image.ChunkSize;
    _getImageDataString.call(this, image);
  };

  var _endUpload = function (image) {
    var request = getDefaultPostRequest();
    request.url = _endUploadUrl;
    request.error = _uploadErrorCallback;
    request.data = '{ "uploadID": "' + image.UploadID + '"}';
    request.success = _completeCallback;
    ajaxRequest(request);
  };
}
