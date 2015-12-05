package mae.iqra;
import java.io.Serializable;

public class Location implements Comparable<Location>, Serializable {
    int chap, verse; 
    public Location (int m, int n) {
    	chap = m; verse = n; 
    }
    public String toString() {
    	return chap+":"+verse;
    }
    public boolean equals(Object p) {
    	return (equals((Location)p));	
    }
    public int compareTo(Location p) {
        return hashCode() - p.hashCode();
    }
    public boolean equals(Location p) {
    	return (chap==p.chap && verse==p.verse);	
    }
    public int hashCode() {
        return 128*chap + verse;
    }
    public static void main(String[] args){
        Location p1 = new Location(2, 285);
        System.out.println(p1);
        Location p2 = new Location(27, 30);
        System.out.println(p2);
        System.out.println(p1.compareTo(p2));
    }    
}

