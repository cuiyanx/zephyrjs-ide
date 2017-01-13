// Suppress warning TS2304 for known objects
declare const ALLOC_NORMAL: number;
declare function intArrayFromString(s: string): number[];
declare function allocate(array: number[], type: string, strategy: number): any;
declare function _convert_ihex(ptr: any): any;
declare function Pointer_stringify(ptr: any): string;
declare function _free(ptr: any): any;


export class WebUsbPort {
    device: any;
    decoder: any;
    encoder: any;

    constructor(device: any) {
        this.device = device;
        this.decoder = new (window as any).TextDecoder();
        this.encoder = new (window as any).TextEncoder('utf-8');
    }

    public onReceive(data: string) {
        // tslint:disable-next-line:no-empty
    }

    public onReceiveError(error: string) {
        // tslint:disable-next-line:no-empty
    }

    public connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.device.open()
            .then(() => {
                if (this.device.configuration === null) {
                    this.device.selectConfiguration(1);
                }

                this.device.claimInterface(2)
                .then(() => {
                    this.device.controlTransferOut({
                        requestType: 'class',
                        recipient: 'interface',
                        request: 0x22,
                        value: 0x01,
                        index: 0x02})
                    .then(() => { resolve(); })
                    .catch((error: string) => {
                        reject('Unable to send control data to the device: ' +
                               error);
                    });
                })
                .catch((error: string) => {
                    reject('Unable to claim device interface: ' + error);
                });
             })
             .catch((error: string) => {
                 reject('Unable to open the device: ' + error);
             });
        });
    }

    public read(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.device.transferIn(3, 64).then((response: any) => {
                let decoded = this.decoder.decode(response.data);
                resolve(decoded);
            });
        });
    }

    public send(data: string, expects?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (data.length === 0) {
                reject('Empty data');
            }

            console.log('Sending: ' + data);

            this.device.transferOut(2, this.encoder.encode(data))
            .then(() => {
                if (expects !== undefined) {
                    let response: string = '',
                        promise: Promise<void> = null;

                    let await_ = () => {
                        promise = this.read().then((value: string) => {
                            response += value;
                            if (response.includes(expects)) {
                                resolve();
                            } else {
                                await_();
                            }
                        });
                    };

                    setTimeout(() => {
                        resolve('Timeout while waiting for a response from the device.');
                    }, 1000);

                    await_();
                } else {
                    resolve();
                }
            })
            .catch((error: string) => {
                reject(error);
            });
        });
    }

    public run(data: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (data.length === 0) {
                reject('Empty data');
            }

            this.send('set transfer ihex\n', '[ECMD]')
                .then(() => this.send('stop\n', '[ECMD]'))
                .then(() => this.send('load\n', '[ECMD]'))
                .then(() => {
                    let ihex =
                        this.convIHex(
                            this.stripBlankLines(
                                this.stripComments(
                                    this.stripConsole(data))));

                    for (let line of ihex.split('\n')) {
                        this.send(line + '\n', '[ACK]');
                    }
                })
                .then(() => this.send('run temp.dat\n', '[ECMD]'))
                .then(() => this.send('set transfer raw\n'))
                .then((warning: string) => resolve(warning))
                .catch((error: string) => reject(error));
        });
    }

    private convIHex(source: string): string {
      let array = intArrayFromString(source);
      let ptr = allocate(array, 'i8', ALLOC_NORMAL);
      let output = _convert_ihex(ptr);
      let iHexString = Pointer_stringify(output);
      _free(ptr);
      return iHexString;
    }

    private stripComments(source: string): string {
      return source.replace(RegExp('[ \t]*//.*', 'g'), '');
    }

    private stripConsole(source: string): string {
      return source.replace(RegExp('console\.[a-zA-Z]+\(.*\)', 'g'), '');
    }

    private stripBlankLines(source: string): string {
      return source.replace(RegExp('^[ \t]*\n', 'gm'), '');
    }
}
