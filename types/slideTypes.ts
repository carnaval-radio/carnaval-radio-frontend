export type GraphQLSlide = {
  id: string;
  attributes: {
    Title?: string;
    Image: {
      data: {
        attributes: {
          url: string;
          width: number;
          height: number;
        };
      };
    } | null;
    Link?: string;
  };
};

export interface Slide {
  Id: string;
  Title?: string;
  Image: SlideImage | null;
  Link?: string;
}

export interface SlideImage {
  Url: string;
  Width: number;
  Height: number;
}


