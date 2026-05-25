export interface Booking {
  id: number;
  name: string;
  phone: string;
  facility: string;
  time: string;
  status: "Confirmed" | "Pending";
}

export interface Facility {
  id: number;
  title: string;
  description: string;
  image: string;
}
