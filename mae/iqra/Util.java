package mae.iqra;

import java.io.*;
import javax.swing.text.JTextComponent;
import javax.swing.text.BadLocationException;

public class Util {
    
    final static String UTF = "UTF-8";
    final static char LEFT = 0xFD3E, RIGHT = 0xFD3F;

    public static boolean onSelection(JTextComponent c, int k) {
       if (!c.hasFocus()) return false;
       return (c.getSelectionStart()<=k && k<c.getSelectionEnd());
    }
    public static String getWordFrom(JTextComponent c, int k) {
       int m = c.getDocument().getLength();
       try {
           String s = c.getText(0, m);
           return getWordFrom(s, k);
       } catch (BadLocationException x) {
           System.out.println(x+": "+m); 
       } catch (Exception x) { //StringIndexOutOfBoundsException
           System.out.print(m+" "); //why??
       }
       return null;
    }
    public static String getWordFrom(String s, int k) {
       if (s.length()<=k || !Character.isLetter(s.charAt(k))) return null;
       int selB = k; int selE = k+1;
       while (!Character.isWhitespace(s.charAt(selB-1))) selB--;
       while (!Character.isWhitespace(s.charAt(selE))) selE++;
       String w = ""; 
       for (int i=selB; i<selE; i++)
           if (Character.isLetter(s.charAt(i))) 
               w += s.charAt(i);
       return w;
    }
    public static Object readObject(InputStream is) {
        Object x = null;
        try {
            ObjectInput in = new ObjectInputStream(is); 
            x = in.readObject();
            //unchecked or unsafe operation ???
            in.close();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        } catch (ClassNotFoundException e) {
            System.out.println(e.getMessage());
        }
        return x;
    }
    public static String[] readText(InputStream is) {
        try {
           char[] c = new char[is.available()];
           Reader in = new InputStreamReader(is, UTF);
           //byte[] b = new byte[is.available()];
           in.read(c); in.close();   //is.read(b); is.close();
           String s = new String(c); //b, UTF
           return s.split("¶"); 
        } catch (Exception x) {
           System.out.println(x); 
           return null;
        }
    }
}
