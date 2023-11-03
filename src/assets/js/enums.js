//Option to show configuration UI.
function LoadScannerOption() {}

LoadScannerOption.UseLastConfiguration = 0;
LoadScannerOption.ShowDriverList = 1;
LoadScannerOption.ShowConnectedDriverList = 2;
LoadScannerOption.ShowDeviceList = 3;

//The file type to use for images.  Some file types can only be used with specific modes.
//An error will be returned if the mode of the image is incompatible with the file type.
export function FileType() {}

FileType.AutoDetect = 0;
FileType.Tiff = 196608;
FileType.Jpeg = 720896;
FileType.Pdf = 1048576;
FileType.Png = 1245184;
FileType.Jpeg2000 = 1310720;

//The file compression to use for images.  Some compression formats can only be used with specific file types or image modes.
//  An error will be returned if the mode of the image or file type is incompatible with the file compression.
export function ImageCompression() {}

ImageCompression.AutoDetect = 0;
ImageCompression.None = 1;
ImageCompression.G4 = 4;
ImageCompression.Lzw = 5;
ImageCompression.Jpeg = 6;
ImageCompression.Zip = 50013;
ImageCompression.Jpeg2000 = 50016;

//Options for encoding image data.
function DataEncoding() {}

DataEncoding.Base16 = 0;
DataEncoding.Base64 = 1;

//Tag type, relates to the ISIS tag type.
function TagType() {}

TagType.Integer = 0;
TagType.String = 1;
TagType.Rational = 2;
TagType.ByteArray = 3;

//The method used to describe the choices for a tag.
function ChoiceKind() {}
ChoiceKind.None = 0;
ChoiceKind.Range = 1;
ChoiceKind.List = 2;

//Scan Job progress state. All states except InProgress areterminal states and imply that the job is finished.
export function TaskStatus() {}

TaskStatus.InProgress = 0;
TaskStatus.Completed = 1;
TaskStatus.Cancelled = 2;
TaskStatus.Error = 3;

//Option for rotating image.
function ImageRotation() {}

ImageRotation.Rotate0 = 0;
ImageRotation.Rotate90 = 1;
ImageRotation.Rotate180 = 2;
ImageRotation.Rotate270 = 3;

//Values for TagId.Orientation
function PixOrientation() {}

PixOrientation.Unknown = 0;
PixOrientation.Portrait = 1;
PixOrientation.Landscape = 2;
PixOrientation.Rotated180 = 3;
PixOrientation.Rotated270 = 4;
PixOrientation.PortM = 5;
PixOrientation.LandM = 6;
PixOrientation.Rotated180M = 7;
PixOrientation.Rotated270M = 8;

//Values for TagId.BarcodeDataType
function PixBarcodeType() {}

PixBarcodeType.None = 0;
PixBarcodeType.EAN8 = 1;
PixBarcodeType.EAN13 = 2;
PixBarcodeType.Code39 = 3;
PixBarcodeType.Code25_Interleaved = 4;
PixBarcodeType.Code25_Matrix = 5;
PixBarcodeType.Code25_Datalogic = 6;
PixBarcodeType.Code25_Industrial = 7;
PixBarcodeType.Patchcode = 8;
PixBarcodeType.Patch_II = 9;
PixBarcodeType.Patch_III = 10;
PixBarcodeType.Patch_Transfer = 11;
PixBarcodeType.Codabar = 12;
PixBarcodeType.UPC_E = 13;
PixBarcodeType.Code93 = 14;
PixBarcodeType.Type128 = 15;
PixBarcodeType.Postnet = 16;
PixBarcodeType.Code25_Airline = 17;
PixBarcodeType.UPC_A = 18;
PixBarcodeType.MICR_E13B = 19;
PixBarcodeType.MICR_CMC7 = 20;
PixBarcodeType.Addon2 = 21;
PixBarcodeType.Addon5 = 22;
PixBarcodeType.Auto = 23;
PixBarcodeType.Patch_I = 24;
PixBarcodeType.Patch_IV = 25;
PixBarcodeType.Patch_VI = 26;
PixBarcodeType.Codabar_Start_Stop = 27;
PixBarcodeType.Code39_ASCII = 28;
PixBarcodeType.Code25_IATA = 29;
PixBarcodeType.MSI = 30;
PixBarcodeType.PDF417 = 31;
PixBarcodeType.UCC128 = 32;
PixBarcodeType.Code25 = 33;
PixBarcodeType.Code25_Invert = 34;
PixBarcodeType.BCDMATRIX = 35;
PixBarcodeType.Code32 = 36;
PixBarcodeType.AZTEC = 37;
PixBarcodeType.DataMatrix = 38;
PixBarcodeType.MaxiCode = 39;
PixBarcodeType.QRCode = 40;
PixBarcodeType.RoyalPost = 41;
PixBarcodeType.AustralianPost = 42;
PixBarcodeType.IntelligentMail = 43;
PixBarcodeType.Reserved1 = 97;
PixBarcodeType.Reserved2 = 98;
PixBarcodeType.Reserved = 99;

//Page side identifier.
function PixPageSide() {}

PixPageSide.Front = 0;
PixPageSide.Back = 1;

//Color format enumeration
export function PixColorFormat() {}

PixColorFormat.Unknown = 0;
PixColorFormat.BlackWhite = 1;
PixColorFormat.Gray4 = 2;
PixColorFormat.Gray8 = 3;
PixColorFormat.Rgb = 4;

PixColorFormat.getFormatName = function (colorFormat) {
  if (colorFormat == PixColorFormat.BlackWhite) {
    return 'Black and White';
  } else if (colorFormat == PixColorFormat.Gray4) {
    return '16-level Gray';
  } else if (colorFormat == PixColorFormat.Gray8) {
    return '256-level Gray';
  } else if (colorFormat == PixColorFormat.Rgb) {
    return '24-bit Color';
  }
  return 'Unknown color format';
};

//Values for TagId.Photometric
function PixPhotometric() {}

PixPhotometric.White0 = 0;
PixPhotometric.White1 = 1;
PixPhotometric.Rgb = 2;
PixPhotometric.Palette = 3;
PixPhotometric.Transparency = 4;
PixPhotometric.Cmyk = 5;
PixPhotometric.Ycbcr = 6;
PixPhotometric.Lab = 8;
PixPhotometric.Bgr = 120;

//Contains all the specific Web Toolkit errors.
export function ISISWebErrorCode() {}

// Encoding is not supported by the method.
ISISWebErrorCode.UnsupportedEncoding = -33;
// This file type is not supported although file is successfully imported.
ISISWebErrorCode.UnsupportedFileType = -32;
// Invalid argument is passed into the method.
ISISWebErrorCode.InvalidArgument = -31;
ISISWebErrorCode.LicensedOnlyForSomeScanners = -30;
ISISWebErrorCode.NotSupportSinglePage = -29;
ISISWebErrorCode.InvalidWebToolkitState = -28;
ISISWebErrorCode.InvalidLicenseScanRestriction = -27;
ISISWebErrorCode.UserDeniedAccess = -26;
ISISWebErrorCode.WebToolkitCrash = -25;
ISISWebErrorCode.SeveralUsersAreLogged = -24;
ISISWebErrorCode.OutOfPaperError = -23;
ISISWebErrorCode.DoubleFeedError = -22;
ISISWebErrorCode.PaperJamError = -21;
ISISWebErrorCode.TokenInvalidError = -20;
ISISWebErrorCode.ImageMetadataCannotBeSavedError = -19;
ISISWebErrorCode.CommandTimeoutCheckStatusError = -18;
ISISWebErrorCode.InvalidCommandWhenProcessingError = -17;
ISISWebErrorCode.ParameterOutOfRangeError = -16;
ISISWebErrorCode.FileReadError = -15;
ISISWebErrorCode.InvalidFileTypeOrCompressionError = -14;
ISISWebErrorCode.SessionTimedOutError = -13;
ISISWebErrorCode.ScanCancelError = -12;
ISISWebErrorCode.InvalidFilenameError = -11;
ISISWebErrorCode.InvalidCommandWhenScanningError = -10;
ISISWebErrorCode.NoChoicesAvailableError = -9;
ISISWebErrorCode.IncorrectTagTypeError = -8;
ISISWebErrorCode.DriverNotLoadedError = -7;
ISISWebErrorCode.TagNotFoundError = -6;
ISISWebErrorCode.JobInvalidError = -5;
ISISWebErrorCode.SessionInvalidError = -4;
ISISWebErrorCode.SessionAlreadyOpenError = -3;
ISISWebErrorCode.InvalidLicenseError = -2;
ISISWebErrorCode.UnknownError = -1;

//Contains a few common tags.
export function Tags() {}

Tags.TAG_YRESOLUTION = 0x11b;
Tags.TAG_XRESOLUTION = 0x11a;
Tags.TAG_PAGESIZE = 0x50e;
Tags.TAG_SCANTYPE = 0x0514;
Tags.TAG_SCANTYPE_AUTOMATIC = 0;
Tags.TAG_SCANTYPE_TRANSPARENCY = 1;
Tags.TAG_SCANTYPE_FLATBED = 2;
Tags.TAG_SCANTYPE_FRONTONLY = 3;
Tags.TAG_SCANTYPE_DUPLEX = 4;
Tags.TAG_SCANTYPE_BACKFRONT = 5;
Tags.TAG_SCANTYPE_BACKONLY = 6;
Tags.TAG_SAMPLESPERPIXEL = 0x0115;
Tags.TAG_BITSPERSAMPLE = 0x0102;
Tags.TAG_PHOTOMETRICINTERPRETATION = 0x0106;
Tags.TAG_PHOTOMETRIC_WHITE0 = 0;
Tags.TAG_PHOTOMETRIC_WHITE1 = 1;
Tags.TAG_PHOTOMETRIC_RGB = 2;
Tags.TAG_PHOTOMETRIC_PALETTE = 3;
Tags.TAG_PHOTOMETRIC_BGR = 120;
Tags.TAG_MODE_COMBO = 0x1734;
Tags.TAG_ENDORSER_STRING = 0x583;

Tags.getScanType = function (scanType) {
  if (scanType == Tags.TAG_SCANTYPE_AUTOMATIC) {
    return 'Automatic';
  } else if (scanType == Tags.TAG_SCANTYPE_TRANSPARENCY) {
    return 'Transparency Unit';
  } else if (scanType == Tags.TAG_SCANTYPE_FLATBED) {
    return 'Flatbed';
  } else if (scanType == Tags.TAG_SCANTYPE_FRONTONLY) {
    return 'ADF (Front Side)';
  } else if (scanType == Tags.TAG_SCANTYPE_DUPLEX) {
    return 'ADF (Duplex)';
  } else if (scanType == Tags.TAG_SCANTYPE_BACKFRONT) {
    return 'ADF(Back Front)';
  } else if (scanType == Tags.TAG_SCANTYPE_BACKONLY) {
    return 'ADF (Back Side)';
  }
  return 'Unknown scan type';
};
