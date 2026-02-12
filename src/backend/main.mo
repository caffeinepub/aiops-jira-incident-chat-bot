import Text "mo:core/Text";
import Blob "mo:core/Blob";

actor {
  public shared ({ caller }) func getGreetingCard() : async Card {
    let greetingCard : Card = {
      title = "🤖 AIOPS Bot";
      subtitle = "Your Virtual Assistant";
      image = "https://media.licdn.com/dms/image/D4D03AQHKKb23MjzDRQ/profile-displayphoto-shrink_400_400/0/1693391415340?e=1721260800&v=beta&t=KondwhAk42TDyKimHy3UgA5B8Xt5gTrqcmdpJvK0kQc";
      header = "Welcome to AIOps";
      content = "How can I help you? Try asking about incidents, priorities, or simply say hi 😊";
      cardType = #aiops;
    };
    greetingCard;
  };

  type Card = {
    title : Text;
    subtitle : Text;
    image : Text;
    header : Text;
    content : Text;
    cardType : CardType;
  };

  type CardType = {
    #aiops;
    #greeting;
    #project;
    #incident;
    #confirmation;
    #faq;
    #help;
  };

  public query ({ caller }) func getStaticAvatar(_userID : Text) : async Blob {
    let avatar : [Nat8] = [209, 131, 203, 87, 207, 65, 121, 190, 18, 200, 46, 9, 38, 28, 109, 71, 124, 43, 214, 143, 23, 127, 133, 142, 56, 149, 28, 234, 52, 61, 225, 4, 143, 45, 25, 99, 52, 125, 176, 230, 103, 221, 43, 178, 199, 182, 176, 119, 193, 228, 168, 15, 166, 31, 157, 4, 102, 106, 22, 17, 249, 8, 208, 70, 31, 233, 235, 139, 56, 94, 31, 254, 227, 206, 14, 38, 73, 20, 10, 161, 200, 50, 10, 247, 221, 209, 12, 187, 155, 6, 3, 98, 233, 32, 98, 144, 189, 219, 243, 133, 127, 122, 206, 171, 141, 214, 230, 243, 135, 242, 243, 130, ];
    Blob.fromArray(avatar);
  };
};
