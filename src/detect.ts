import { queryParams } from './query-params';

export class DeviceDetector {
  static readonly IS_MOBILE = /Mobi|Android/i.test(navigator.userAgent);

  static readonly IS_TV =
    /Android TV|SmartTV|AppleTV|Tizen|webOS|NetCast|Roku|PhilipsTV|SonyTV|HbbTV|LGTV|Viera|Aquos/i.test(
      navigator.userAgent
    );

  static readonly LOW_END =
    DeviceDetector.IS_MOBILE || DeviceDetector.IS_TV || 'lowend' in queryParams;

  static readonly HIGH_END = !DeviceDetector.LOW_END;
}
