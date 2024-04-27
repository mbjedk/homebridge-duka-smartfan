import type { UnitOnOff } from './packet';

export class Device {
  constructor(
    public readonly ip: string,
    public readonly deviceId: string,
    public readonly name: string,
    public readonly password: string,
  ) {
  }
}

export class DeviceStatus {
  constructor(
    public readonly active: UnitOnOff,
    public readonly boost: UnitOnOff,
  ) {
  }
}

export class FanSpeedStatus {
  constructor(
    public readonly silent: number,
    public readonly max: number,
  ) {
  }
}