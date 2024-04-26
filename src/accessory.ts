import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { DukaSmartFanPlatform } from './platform';
import { DukaSmartFanClient } from './client';
import { UnitOnOff } from './packet';
import { Device } from './device';

export class DukaSmartFanAccessory {
  private service: Service;
  private client: DukaSmartFanClient;

  constructor(
    private readonly platform: DukaSmartFanPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Device
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'DUKA')
      .setCharacteristic(this.platform.Characteristic.Model, 'SmartFan')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.deviceId);

    // Main Fan Control
    this.service =
      this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan);

    this.service.setCharacteristic(this.platform.Characteristic.Name, device.name);

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getActive.bind(this))
      .onSet(this.setActive.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .onGet(this.getSilentFanSpeed.bind(this))
      .onSet(this.setSilentFanSpeed.bind(this));

    // Boost Control
    const boostControl = this.accessory.getService('Boost Control') ||
    this.accessory.addService(this.platform.Service.Fan, 'Boost Control', 'BOOST_CONTROL_SWITCH');

    boostControl.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getBoostOnOff.bind(this))
      .onSet(this.setBoost.bind(this));

    boostControl.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .onGet(this.getMaxFanSpeed.bind(this))
      .onSet(this.setMaxFanSpeed.bind(this));

    // Init Duka Comms
    this.client = new DukaSmartFanClient(this.device);
  }

  async getActive(): Promise<CharacteristicValue> {
    this.platform.log.debug('[%s] Get status', this.device.deviceId);
    return this.client
      .getStatus()
      .then((status) => {
        this.platform.log.debug('[%s] Status:', this.device.deviceId, status);
        return status.active;
      })
      .catch(this.handleError.bind(this));
  }

  async setActive(value: CharacteristicValue) {
    this.platform.log.debug('[%s] Turn on/off ->', this.device.deviceId, value);
    return this.client
      .setActive(<UnitOnOff>value)
      .then((active) => this.platform.log.debug('[%s] Turned on/off:', this.device.deviceId, active))
      .catch(this.handleError.bind(this));
  }

  async getBoostOnOff(): Promise<CharacteristicValue> {
    this.platform.log.debug('[%s] Get boost status', this.device.deviceId);
    return this.client
      .getStatus()
      .then((status) => {
        this.platform.log.debug('[%s] Status:', this.device.deviceId, status);
        return status.boost;
      })
      .catch(this.handleError.bind(this));
  }

  async setBoost(value: CharacteristicValue) {
    this.platform.log.debug('[%s] Turn boost on/off ->', this.device.deviceId, value);
    return this.client
      .setBoost(<UnitOnOff>value)
      .then((active) => this.platform.log.debug('[%s] Turned on/off:', this.device.deviceId, active))
      .catch(this.handleError.bind(this));
  }

  async getSilentFanSpeed(): Promise<CharacteristicValue> {
    this.platform.log.debug('[%s] Get silent fanspeed', this.device.deviceId);
    return this.client
      .getFanSpeeds()
      .then((status) => {
        this.platform.log.debug('[%s] Silent Fan Speed:', this.device.deviceId, status);
        return status.silent;
      })
      .catch(this.handleError.bind(this));
  }

  async setSilentFanSpeed(value: CharacteristicValue) {
    this.platform.log.debug('[%s] Set silent fanspeed ->', this.device.deviceId, value);
    return this.client
      .setFanSpeed('silent', <number>value)
      .then((active) => this.platform.log.debug('[%s] Silent fanspeed:', this.device.deviceId, active))
      .catch(this.handleError.bind(this));
  }

  async getMaxFanSpeed(): Promise<CharacteristicValue> {
    this.platform.log.debug('[%s] Get max fanspeed', this.device.deviceId);
    return this.client
      .getFanSpeeds()
      .then((status) => {
        this.platform.log.debug('[%s] Max Fan Speed:', this.device.deviceId, status);
        return status.max;
      })
      .catch(this.handleError.bind(this));
  }

  async setMaxFanSpeed(value: CharacteristicValue) {
    this.platform.log.debug('[%s]Set max fanspeed ->', this.device.deviceId, value);
    return this.client
      .setFanSpeed('max', <number>value)
      .then((active) => this.platform.log.debug('[%s] Max fanspeed:', this.device.deviceId, active))
      .catch(this.handleError.bind(this));
  }

  private handleError(error: Error): Promise<CharacteristicValue> {
    this.platform.log.error('[%s] Client error:', this.device.deviceId, error.message);
    throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.OPERATION_TIMED_OUT);
  }
}
