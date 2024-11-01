interface iObserver {
  next: (value: any) => void;
  error: (error: any) => void;
  complete: () => void;
  unsubscribe: () => void;
}

class Observer implements iObserver {
  constructor(handlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

const HTTP_POST_METHOD: "POST" = "POST";
const HTTP_GET_METHOD: "GET" = "GET";

const HTTP_STATUS_OK: 200 = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR: 500 = 500;

type UserMockType = {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
};

const userMock: UserMockType = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleated: false,
};

type requestMockType = {
  method: typeof HTTP_POST_METHOD | typeof HTTP_GET_METHOD;
  host: string;
  path: string;
  body?: UserMockType;
  params: Record<string, any>; // { [prop: string]: any }
};

const requestsMock: requestMockType[] = [
  {
    method: HTTP_POST_METHOD,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request) => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};
const handleError = (error) => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
