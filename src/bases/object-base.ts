import { ForceMethodBase } from "../errors/force-method-implementation";

export abstract class ObjectBase {
    protected name: string = "__UNDEFINED_NAME__";

    protected readonly args: { [ key: string ]: any };

    public constructor( args?: any ) {
        this.args = args || {};

        this.name = this.getName();
    }

    public static getName(): string {
        throw new ForceMethodBase( this.name, "getName" );
    }

    public getName(): string {
        return ( this.constructor as typeof ObjectBase ).getName();
    }
}

export default ObjectBase;
