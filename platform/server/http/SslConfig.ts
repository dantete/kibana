import * as crypto from 'crypto';
import { has } from 'lodash';

import { Schema, typeOfSchema } from '../../types/schema';

// `crypto` type definitions doesn't currently include `crypto.constants`, see
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/fa5baf1733f49cf26228a4e509914572c1b74adf/types/node/v6/index.d.ts#L3412
const cryptoConstants = (crypto as any).constants;

const createSslSchema = (schema: Schema) => {
  const { object, boolean, string, arrayOf, oneOf, literal, maybe } = schema;

  return object(
    {
      enabled: boolean({
        defaultValue: false
      }),
      certificate: maybe(string()),
      key: maybe(string()),
      keyPassphrase: maybe(string()),
      certificateAuthorities: maybe(arrayOf(string())),
      supportedProtocols: maybe(
        arrayOf(
          oneOf([literal('TLSv1'), literal('TLSv1.1'), literal('TLSv1.2')])
        )
      ),
      cipherSuites: arrayOf(string(), {
        defaultValue: cryptoConstants.defaultCoreCipherList.split(':')
      })
    },
    {
      validate: ssl => {
        if (ssl.enabled && (!has(ssl, 'certificate') || !has(ssl, 'key'))) {
          return 'must specify [certificate] and [key] when ssl is enabled';
        }
      }
    }
  );
};

const sslConfigType = typeOfSchema(createSslSchema);
type SslConfigType = typeof sslConfigType;

export class SslConfig {
  /**
   * @internal
   */
  static createSchema = createSslSchema;

  enabled: boolean;
  key: string | undefined;
  certificate: string | undefined;
  certificateAuthorities: string[] | undefined;
  keyPassphrase: string | undefined;
  cipherSuites: string[];
  supportedProtocols: string[] | undefined;

  /**
   * @internal
   */
  constructor(config: SslConfigType) {
    this.enabled = config.enabled;
    this.key = config.key;
    this.certificate = config.certificate;
    this.certificateAuthorities = config.certificateAuthorities;
    this.keyPassphrase = config.keyPassphrase;
    this.cipherSuites = config.cipherSuites;
    this.supportedProtocols = config.supportedProtocols;
  }
}