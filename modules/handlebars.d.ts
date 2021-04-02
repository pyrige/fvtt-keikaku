declare namespace Handlebars {
  interface TemplateDelegate<T = any> {
    (context: T, options?: RuntimeOptions): string;
  }

  type Template<T = any> = TemplateDelegate<T> | string;

  interface RuntimeOptions {
    partial?: boolean;
    depths?: any[];
    helpers?: { [name: string]: Function };
    partials?: { [name: string]: HandlebarsTemplateDelegate };
    decorators?: { [name: string]: Function };
    data?: any;
    blockParams?: any[];
    allowCallsToHelperMissing?: boolean;
    allowedProtoProperties?: { [name: string]: boolean };
    allowedProtoMethods?: { [name: string]: boolean };
    allowProtoPropertiesByDefault?: boolean;
    allowProtoMethodsByDefault?: boolean;
  }

  interface HelperOptions {
    fn: TemplateDelegate;
    inverse: TemplateDelegate;
    hash: any;
    data?: any;
  }

  interface HelperDelegate {
    (
      context?: any,
      arg1?: any,
      arg2?: any,
      arg3?: any,
      arg4?: any,
      arg5?: any,
      options?: HelperOptions
    ): any;
  }

  interface HelperDeclareSpec {
    [key: string]: HelperDelegate;
  }

  function registerHelper(name: string, fn: HelperDelegate): void;
  function registerHelper(name: HelperDeclareSpec): void;
  function unregisterHelper(name: string): void;
}

type HandlebarsTemplateDelegate<T = any> = Handlebars.TemplateDelegate<T>;
