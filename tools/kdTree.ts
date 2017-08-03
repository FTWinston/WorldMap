interface kdPoint {
    [key:string]:number
};

class kdNode<TPoint> {
    constructor(public point: TPoint, public dimension: any, public parent?: kdNode<TPoint>) {
    }
    left?: kdNode<TPoint>;
    right?: kdNode<TPoint>;
}

class kdTree<TPoint, TCoord> {
    constructor(public points: TPoint[], public distanceMetric: (from: TCoord, to: TPoint) => number, public dimensions: string[]) {
        this.root = this.buildTree(points, 0) as kdNode<TPoint>;
    }
    root?: kdNode<TPoint>;

    buildTree(points: TPoint[], depth: number, parent?: kdNode<TPoint>) {
        if (points.length === 0)
            return undefined;

        let dim = depth % this.dimensions.length;

        if (points.length === 1)
            return new kdNode(points[0], dim, parent);

        (points as any[] as kdPoint[]).sort(function (a: kdPoint, b: kdPoint) {
            return a[this.dimensions[dim]] - b[this.dimensions[dim]];
        }.bind(this));

        let median = Math.floor(points.length / 2);
        let node = new kdNode(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);

        return node;
    }
    
    private nearestSearch(point: TCoord, node: kdNode<TPoint>, best: [kdNode<TPoint> | undefined, number]) {
        let dimension = this.dimensions[node.dimension];
        let ownDistance = this.distanceMetric(point, node.point);
        let linearPoint: kdPoint = {};

        for (let i = 0; i < this.dimensions.length; i += 1) {
            if (i === node.dimension)
                linearPoint[this.dimensions[i]] = (point as any as kdPoint)[this.dimensions[i]];
            else
                linearPoint[this.dimensions[i]] = (node.point as any as kdPoint)[this.dimensions[i]];
        }

        if (node.right === undefined && node.left === undefined) {
            if (ownDistance < best[1]) {
                best[0] = node;
                best[1] = ownDistance;
            }
            return;
        }

        let bestChild;
        if (node.right === undefined)
            bestChild = node.left;
        else if (node.left === undefined)
            bestChild = node.right;
        else if ((point as any as kdPoint)[dimension] < (node.point as any as kdPoint)[dimension])
            bestChild = node.left;
        else
            bestChild = node.right;

        this.nearestSearch(point, bestChild as kdNode<TPoint>, best);

        if (ownDistance < best[1]) {
            best[0] = node;
            best[1] = ownDistance;
        }

        let linearDistance = this.distanceMetric(linearPoint as any as TCoord, node.point);

        if (linearDistance < best[1]) {
            let otherChild;
            if (bestChild === node.left)
                otherChild = node.right;
            else
                otherChild = node.left;

            if (otherChild !== undefined)
                this.nearestSearch(point, otherChild, best);
        }
    }
    nearest(point: TCoord, maxDistance?: number) {
        let best: [kdNode<TPoint> | undefined, number] = [undefined, Number.MAX_VALUE];

        if(this.root)
            this.nearestSearch(point, this.root, best);
        
        return best[0] === undefined ? undefined : (best[0] as kdNode<TPoint>).point;
    }

    balanceFactor() {
        function height(node?: kdNode<TPoint>): number {
            if (node === undefined)
                return 0;
            
            return Math.max(height(node.left), height(node.right)) + 1;
        }

        function count(node?: kdNode<TPoint>): number {
            if (node === undefined)
                return 0;
            return count(node.left) + count(node.right) + 1;
        }

        return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
    }
}
