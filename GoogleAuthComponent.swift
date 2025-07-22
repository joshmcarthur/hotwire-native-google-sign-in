import HotwireNative
import GoogleSignIn

final class GoogleAuthComponent: BridgeComponent {
    override class var name: String { "google-auth" }
   
    override func onReceive(message: Message) {
           guard let event = Event(rawValue: message.event) else {
               return
           }
           
           switch event {
           case .authorize:
               handleAuthorizeEvent(message: message)
           }
       }
    
    // MARK: Private
    
    private var viewController: UIViewController? {
        delegate?.destination as? UIViewController
   }
    
    
    private func handleAuthorizeEvent(message: Message) {
        GIDSignIn.sharedInstance.signIn(
            withPresenting: viewController!) { signInResult, error in
                guard signInResult != nil else {
                    self.reply(with: message.replacing(data: AuthorizeMessageData(code: nil, error: error!.localizedDescription)))
                    return
                }
                
                self.reply(with: message.replacing(data: AuthorizeMessageData(code: signInResult!.serverAuthCode, error: nil)))
                
            }
    }
    
}

// MARK: Events

private extension GoogleAuthComponent {
    enum Event: String {
        case authorize
    }
    
    struct AuthorizeMessageData: Encodable {
        let code: String?
        let error: String?
    }
}
