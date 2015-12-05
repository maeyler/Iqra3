package mae.iqra;

public class Reference extends Number {

    public static final int M = 10;
    Location[] loc; int count;
    
    public Reference() {
        loc = new Location[M];
        count = 0; 
    }
    public Reference(Location v) {
        this(); 
        addLocation(v);
    }
    public boolean addLocation(Location v) {
        boolean add = (count < loc.length);
        if (add) loc[count] = v;
        count++;
        return add;
    }
    public boolean compact() {
        if (count >= loc.length) return false;
        Location[] a = new Location[count];
        System.arraycopy(loc, 0, a, 0, count);
        loc = a;
        return true;
    }
    public Location[] getLocations() {
        return loc;
    }
    public int intValue() {
        return count;
    }
    public long longValue() {
        return count;
    }
    public float floatValue() {
        return count;
    }
    public double doubleValue() {
        return count;
    }
    public String toString() {
        return ""+count;
    }
    public String toLongString() {
        String s = count+" ";
        int n = Math.min(count, M) - 1;
        for (int i=0; i<n; i++)
            s += loc[i]+" ";
        return s+loc[n]; 
    }
    public static void main(String[] args) {
        Reference T = new Reference(new Location(5,155)); 
        T.addLocation(new Location(2,214)); 
        T.addLocation(new Location(1,3)); 
        System.out.println(T); T.compact();
        System.out.println(T.toLongString());
    }
}
