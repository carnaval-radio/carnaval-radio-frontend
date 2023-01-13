export type GraphQLSponsor = {
  attributes: {
    Name: string;
    Logo: {
      data: {
        attributes: {
          url: string;
          width: number;
          height: number;
        };
      };
    };
    Type: { data: { id: string } };
  };
};

export type GraphQLSponsorType = {
  id: string;
  attributes: {
    Name: string;
    Order: number;
    LogoSize: string;
  };
};

export interface SponsorType {
  Id: string;
  Name: string;
  Order: number;
  LogoSize: string;
}

export interface Sponsor {
  Name: string;
  Logo: Image;
  TypeID: string;
}

export interface Image {
  Url: string;
  Width: number;
  Height: number;
}
