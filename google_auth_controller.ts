import { BridgeComponent, Message } from '@hotwired/hotwire-native-bridge';

interface AuthorizationResponseData {
  code: string;
  error?: string;
}

interface AuthorizationResponseMessage extends Message {
  data: AuthorizationResponseData;
}

export default class GoogleAuthController extends BridgeComponent {
  public static component = 'google-auth';

  private _enable() {
    if ('disabled' in this.element) {
      this.element.disabled = false;
    }
  }

  private _disable() {
    if ('disabled' in this.element) {
      this.element.disabled = true;
    }
  }

  public authorize(e: Event): void {
    e.preventDefault();

    this._disable();

    this.send('authorize', {}, ({ data }: AuthorizationResponseMessage) => {
      this._checkAuthorization(data);
    });
  }

  private _checkAuthorization({
    code,
    error
  }: AuthorizationResponseData): void {
    this._enable();

    if (!code) {
      this._generalError(error);

      return;
    }

    const formData = new FormData();

    formData.append('code', code);
    formData.append('redirect_uri', '');

    fetch('/auth/google/callback', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (response.redirected) {
          window.location.reload();
        } else {
          this._generalError();
        }
      })
      .catch(() => {
        this._generalError();
      });
  }

  private _generalError(message?: string) {
    // eslint-disable-next-line no-alert
    alert(
      message ?? 'Could not authenticate using Google, please try another way.'
    );
  }
}
